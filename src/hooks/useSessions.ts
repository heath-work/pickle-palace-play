
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Session, SessionRegistration } from '@/types/sessions';
import { useFetchSessions } from './useFetchSessions';
import { useFetchUserSessions } from './useFetchUserSessions';
import { useSessionRegistration } from './useSessionRegistration';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userSessions, setUserSessions] = useState<SessionRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Pass user to fetchSessions for waitlist state/visibility
  const fetchSessions = useFetchSessions(setSessions, setIsLoading, user);
  const fetchUserSessions = useFetchUserSessions(setUserSessions, setIsLoading, user);

  const { registerForSession, cancelSessionRegistration, cancelWaitlist } =
    useSessionRegistration(user, fetchSessions, fetchUserSessions, setUserSessions);

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
    cancelWaitlist,
    fetchSessions,
  };
}
