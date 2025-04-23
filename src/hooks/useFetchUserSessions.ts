
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SessionRegistration } from '@/types/sessions';

export const useFetchUserSessions = (setUserSessions: (s: SessionRegistration[]) => void, setIsLoading: (loading: boolean) => void, user: any) =>
  useCallback(async () => {
    if (!user) {
      setUserSessions([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data: registrations, error } = await supabase
        .from('session_registrations')
        .select('*')
        .eq('user_id', user.id)
        .not('status', 'eq', 'cancelled')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!registrations || registrations.length === 0) {
        setUserSessions([]);
        return;
      }

      const completeRegistrations: SessionRegistration[] = [];
      for (const registration of registrations) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*, courts(name, type)')
          .eq('id', registration.session_id)
          .maybeSingle();
        if (sessionData) {
          completeRegistrations.push({
            ...registration,
            session: sessionData
          } as SessionRegistration);
        }
      }
      setUserSessions(completeRegistrations);
    } catch {
      toast.error('Failed to load your sessions');
    } finally {
      setIsLoading(false);
    }
  }, [setUserSessions, setIsLoading, user]);
