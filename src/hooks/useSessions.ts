
import { useState, useEffect, useCallback } from 'react';
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

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching all available sessions');
      const { data, error } = await supabase
        .from('sessions')
        .select('*, courts(name, type)')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      // Fetch current registration count for each session
      const sessionsWithRegistrationCount = await Promise.all(
        (data || []).map(async (session) => {
          try {
            // Count all active (non-cancelled) registrations
            const { count, error: countError } = await supabase
              .from('session_registrations')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', session.id)
              .eq('status', 'registered');

            if (countError) {
              console.error('Error fetching registration count:', countError);
              return {
                ...session,
                current_registrations: 0
              } as Session;
            }

            console.log(`Session ${session.id} has ${count} registrations`);
            
            return {
              ...session,
              current_registrations: count || 0
            } as Session;
          } catch (countErr) {
            console.error('Exception fetching registration count:', countErr);
            return {
              ...session,
              current_registrations: 0
            } as Session;
          }
        })
      );

      setSessions(sessionsWithRegistrationCount);
      console.log('Sessions fetched successfully:', sessionsWithRegistrationCount.length);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserSessions = useCallback(async () => {
    if (!user) {
      console.log('No user logged in, skipping user sessions fetch');
      setUserSessions([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching registrations for user:', user.id);
      const { data: registrations, error } = await supabase
        .from('session_registrations')
        .select('*')
        .eq('user_id', user.id)
        .not('status', 'eq', 'cancelled') // Only fetch non-cancelled registrations
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user registrations:', error);
        throw error;
      }

      console.log('User registrations found:', registrations?.length || 0);
      
      if (!registrations || registrations.length === 0) {
        setUserSessions([]);
        return;
      }
      
      // Create an array to store the complete session registrations
      const completeRegistrations: SessionRegistration[] = [];
      
      // Fetch session details for each registration
      for (const registration of registrations) {
        try {
          const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('*, courts(name, type)')
            .eq('id', registration.session_id)
            .maybeSingle();
          
          if (sessionError) {
            console.error('Error fetching session details:', sessionError);
            continue;
          }
          
          if (sessionData) {
            completeRegistrations.push({
              ...registration,
              session: sessionData
            } as SessionRegistration);
          }
        } catch (sessionErr) {
          console.error('Exception fetching session details:', sessionErr);
        }
      }
      
      setUserSessions(completeRegistrations);
      console.log('User sessions processed successfully:', completeRegistrations.length);
    } catch (error) {
      console.error('Error in fetchUserSessions:', error);
      toast.error('Failed to load your sessions');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const registerForSession = async (sessionId: string) => {
    if (!user) {
      toast.error('Please sign in to register for a session');
      return null;
    }

    try {
      console.log('Registering for session:', sessionId);
      
      // First, check if there's an existing registration (even cancelled ones)
      const { data: existingRegistration, error: checkError } = await supabase
        .from('session_registrations')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing registration:', checkError);
        throw checkError;
      }

      // Get session details for max players limit
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('max_players')
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionError) {
        console.error('Error fetching session for registration:', sessionError);
        throw sessionError;
      }

      if (!session) {
        console.error('Session not found for registration');
        throw new Error('Session not found');
      }

      // Count current registrations to determine status
      const { count, error: countError } = await supabase
        .from('session_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', 'registered');

      if (countError) {
        console.error('Error counting registrations:', countError);
        throw countError;
      }

      const status: SessionStatus = 
        (count || 0) < (session?.max_players || 0) ? 'registered' : 'waitlisted';

      let data;
      let error;

      if (existingRegistration) {
        // If registration exists (even if cancelled), update it
        console.log('Updating existing registration:', existingRegistration.id);
        const result = await supabase
          .from('session_registrations')
          .update({ status })
          .eq('id', existingRegistration.id)
          .select()
          .single();
          
        data = result.data;
        error = result.error;
      } else {
        // Create a new registration if none exists
        console.log('Creating new registration for session');
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

      if (error) {
        console.error('Error registering for session:', error);
        throw error;
      }

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
      console.log('Cancelling session registration:', registrationId);
      const { error } = await supabase
        .from('session_registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId);

      if (error) {
        console.error('Error cancelling registration:', error);
        throw error;
      }

      // Remove the cancelled registration from the state directly
      setUserSessions(prevSessions => 
        prevSessions.filter(session => session.id !== registrationId)
      );

      toast.success('Successfully cancelled session registration');
      
      // Refresh sessions after cancellation
      await fetchSessions();
    } catch (error: any) {
      console.error('Error cancelling session registration:', error);
      toast.error(error.message || 'Failed to cancel session registration');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (user) {
      fetchUserSessions();
    } else {
      setUserSessions([]);
    }
  }, [user, fetchUserSessions]);

  return {
    sessions,
    userSessions,
    isLoading,
    registerForSession,
    cancelSessionRegistration,
    fetchSessions,
  };
}
