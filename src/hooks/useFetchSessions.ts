
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getSessionParticipants } from '@/integrations/supabase/get-session-participants';
import { Session } from '@/types/sessions';
import { getAestDate } from '@/utils/aestDate';

export const useFetchSessions = (setSessions: (s: Session[]) => void, setIsLoading: (loading: boolean) => void) =>
  useCallback(async () => {
    setIsLoading(true);
    try {
      // Get current AEST date YYYY-MM-DD
      const now = new Date();
      const aestOffset = 10 * 60;
      const utcOffset = now.getTimezoneOffset();
      const totalOffsetMinutes = utcOffset + aestOffset;
      const aestDate = new Date(now.getTime() + totalOffsetMinutes * 60000)
        .toISOString()
        .split('T')[0];

      // Archive past sessions
      await supabase
        .from('sessions')
        .update({ is_active: false })
        .lt('date', aestDate)
        .eq('is_active', true);

      // Fetch active sessions (not in the past)
      const { data, error } = await supabase
        .from('sessions')
        .select('*, courts(name, type)')
        .eq('is_active', true)
        .gte('date', aestDate) // <-- Only fetch present/future
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      // Calculate total_spots and count current registrations using getSessionParticipants
      const sessionsWithRegistrationCount = await Promise.all(
        (data || []).map(async (session) => {
          try {
            const participants = await getSessionParticipants(session.id);
            const registeredCount = participants.filter(p => p.status === 'registered').length;
            const totalSpots = session.max_players;
            return {
              ...session,
              current_registrations: registeredCount,
              total_spots: totalSpots,
            } as Session;
          } catch {
            return {
              ...session,
              current_registrations: 0,
              total_spots: session.max_players,
            } as Session;
          }
        })
      );

      setSessions(sessionsWithRegistrationCount);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [setSessions, setIsLoading]);
