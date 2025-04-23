
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SessionStatus } from '@/types/sessions';

export function useSessionRegistration(user: any, fetchSessions: () => Promise<void>, fetchUserSessions: () => Promise<void>, setUserSessions: (arg: any) => void) {
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

      // Fetch session for max_players
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('max_players')
        .eq('id', sessionId)
        .maybeSingle();
      if (!session) throw new Error('Session not found');
      if (sessionError) throw sessionError;

      // Count current registrations
      const { count, error: countError } = await supabase
        .from('session_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', 'registered');
      if (countError) throw countError;

      const status: SessionStatus = (count || 0) < (session?.max_players || 0) ? 'registered' : 'waitlisted';

      let data;
      let error;
      if (existingRegistration) {
        const result = await supabase
          .from('session_registrations')
          .update({ status })
          .eq('id', existingRegistration.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('session_registrations')
          .insert({
            session_id: sessionId,
            user_id: user.id,
            status
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }
      if (error) throw error;

      toast.success(`Successfully ${status === 'waitlisted' ? 'waitlisted' : 'registered'} for the session`);
      await fetchSessions();
      await fetchUserSessions();

      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to register for session');
      return null;
    }
  };

  // Cancel session registration
  const cancelSessionRegistration = async (registrationId: string) => {
    try {
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel session registration');
    }
  };

  return { registerForSession, cancelSessionRegistration };
}
