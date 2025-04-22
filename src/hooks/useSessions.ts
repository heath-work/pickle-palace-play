import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session, SessionRegistration, SessionStatus } from '@/types/sessions';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userSessions, setUserSessions] = useState<SessionRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, courts(name, type)')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (error) throw error;

      // Fetch current registration count for each session
      const sessionsWithRegistrationCount = await Promise.all(
        (data || []).map(async (session) => {
          const { count } = await supabase
            .from('session_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)
            .eq('status', 'registered');

          return {
            ...session,
            current_registrations: count || 0
          } as Session;
        })
      );

      setSessions(sessionsWithRegistrationCount);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSessions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: registrations, error } = await supabase
        .from('session_registrations')
        .select('*, session:sessions(*), session:sessions(courts(name, type))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserSessions(registrations as SessionRegistration[]);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      toast.error('Failed to load your sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const registerForSession = async (sessionId: string) => {
    if (!user) {
      toast.error('Please sign in to register for a session');
      return null;
    }

    try {
      const { data: session } = await supabase
        .from('sessions')
        .select('max_players')
        .eq('id', sessionId)
        .single();

      const { count } = await supabase
        .from('session_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', 'registered');

      const status: SessionStatus = 
        (count || 0) < (session?.max_players || 0) ? 'registered' : 'waitlisted';

      const { data, error } = await supabase
        .from('session_registrations')
        .insert({ 
          session_id: sessionId, 
          user_id: user.id, 
          status 
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Successfully ${status === 'waitlisted' ? 'waitlisted' : 'registered'} for the session`);
      
      // Refresh sessions after registration
      await fetchSessions();
      await fetchUserSessions();

      return data;
    } catch (error: any) {
      console.error('Error registering for session:', error);
      toast.error(error.message || 'Failed to register for session');
      return null;
    }
  };

  const cancelSessionRegistration = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('session_registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId);

      if (error) throw error;

      toast.success('Successfully cancelled session registration');
      
      // Refresh sessions after cancellation
      await fetchSessions();
      await fetchUserSessions();
    } catch (error: any) {
      console.error('Error cancelling session registration:', error);
      toast.error(error.message || 'Failed to cancel session registration');
    }
  };

  useEffect(() => {
    fetchSessions();
    if (user) fetchUserSessions();
  }, [user]);

  return {
    sessions,
    userSessions,
    isLoading,
    registerForSession,
    cancelSessionRegistration,
    fetchSessions,
  };
}
