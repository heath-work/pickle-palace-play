
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SessionStatus } from '@/types/sessions';

export function useSessionRegistration(
  user: any, 
  fetchSessions: () => Promise<void>, 
  fetchUserSessions: () => Promise<void>, 
  setUserSessions: (arg: any) => void
) {
  // Register for a session (waitlist if full)
  const registerForSession = async (sessionId: string) => {
    if (!user) {
      toast.error('Please sign in to register for a session');
      return null;
    }
    try {
      // Check if already registered
      const { data: existingRegistration, error: checkError } = await supabase
        .from('session_registrations')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (checkError) throw checkError;
      if (existingRegistration && existingRegistration.status !== 'cancelled') {
        toast.info('You are already registered for this session.');
        return null;
      }

      // Check if already waitlisted
      const { data: existingWaitlist } = await supabase
        .from('session_waitlist')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (existingWaitlist) {
        toast.info('You are already on the waitlist for this session.');
        return null;
      }

      // Fetch session info for max_players
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('max_players')
        .eq('id', sessionId)
        .maybeSingle();
      if (!session) throw new Error('Session not found');
      if (sessionError) throw sessionError;

      // Count current registrations
      const { count: registeredCount, error: countError } = await supabase
        .from('session_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', 'registered');
      if (countError) throw countError;

      const isFull = (registeredCount || 0) >= (session?.max_players || 0);

      let result;
      if (!isFull) {
        // Register as participant (or update old/cancelled reg to registered)
        if (existingRegistration) {
          result = await supabase
            .from('session_registrations')
            .update({ status: 'registered', was_waitlisted: existingRegistration.was_waitlisted })
            .eq('id', existingRegistration.id)
            .select()
            .single();
        } else {
          result = await supabase
            .from('session_registrations')
            .insert({
              session_id: sessionId,
              user_id: user.id,
              status: 'registered'
            })
            .select()
            .single();
        }
        if (result.error) throw result.error;
        toast.success('Successfully registered for the session');
        await fetchSessions();
        await fetchUserSessions();
        return result.data;
      } else {
        // Add to session_waitlist
        // Find new position number
        const { count: waitlistCount } = await supabase
          .from('session_waitlist')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', sessionId);
        const position = 1 + (waitlistCount || 0);
        const { error: waitlistError } = await supabase
          .from('session_waitlist')
          .insert({
            session_id: sessionId,
            user_id: user.id,
            position
          });
        if (waitlistError) {
          if (waitlistError.code === '23505') { // duplicate key 
            toast.info('You are already on the waitlist for this session.');
          } else {
            toast.error(waitlistError.message || 'Failed to join waitlist');
          }
          return null;
        }
        toast.info('Session full — you have been added to the waitlist');
        await fetchSessions();
        await fetchUserSessions();
        return { status: 'waitlisted' };
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to register for session');
      return null;
    }
  };

  // Cancel session registration
  const cancelSessionRegistration = async (registrationId: string, sessionId?: string) => {
    try {
      // 1. Cancel their registration
      const { error } = await supabase
        .from('session_registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId);
      if (error) throw error;
      setUserSessions((prev: any) =>
        prev.filter((session: any) => session.id !== registrationId)
      );
      toast.success('Successfully cancelled session registration');
      await fetchSessions();

      // 2. After cancellation, promote from waitlist if exists
      if (sessionId) {
        // Find the next-in-line waitlister
        const { data: waitlist, error: waitlistFetchErr } = await supabase
          .from('session_waitlist')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(1);
        if (waitlistFetchErr) throw waitlistFetchErr;
        if (waitlist && waitlist.length > 0) {
          const promotedUser = waitlist[0];
          // Remove from waitlist
          await supabase
            .from('session_waitlist')
            .delete()
            .eq('id', promotedUser.id);

          // Add registration for promoted user (flag `was_waitlisted` true)
          await supabase.from('session_registrations').insert({
            session_id: sessionId,
            user_id: promotedUser.user_id,
            status: 'registered',
            was_waitlisted: true
          });

          // Optionally, send notification here (not implemented)
        }
      }
      await fetchUserSessions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel session registration');
    }
  };

  // Cancel waitlist (not used directly but to enable leave-waitlist)
  const cancelWaitlist = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('session_waitlist')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
      if (error) throw error;
      toast.success('You have left the waitlist');
      await fetchSessions();
      await fetchUserSessions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave waitlist');
    }
  };

  return { registerForSession, cancelSessionRegistration, cancelWaitlist };
}
