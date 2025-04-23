
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getSessionParticipants } from '@/integrations/supabase/get-session-participants';
import { Session } from '@/types/sessions';
import { getAestDate } from '@/utils/aestDate';

export const useFetchSessions = (
  setSessions: (s: Session[]) => void, 
  setIsLoading: (loading: boolean) => void, 
  user?: any
) =>
  useCallback(async () => {
    setIsLoading(true);
    try {
      // Get current AEST date YYYY-MM-DD
      const aestDate = getAestDate();
      console.log('Fetching sessions for date (AEST):', aestDate);

      // Archive past sessions
      const { error: archiveError } = await supabase
        .from('sessions')
        .update({ is_active: false })
        .lt('date', aestDate)
        .eq('is_active', true);
      if (archiveError) {
        console.error('Error archiving past sessions:', archiveError);
      }

      // Fetch active sessions (not in the past)
      const { data, error } = await supabase
        .from('sessions')
        .select('*, courts(name, type)')
        .eq('is_active', true)
        .gte('date', aestDate)
        .order('date', { ascending: true });
      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      console.log('Fetched sessions raw data:', data);

      // Calculate total_spots, registration count, waitlist state
      const sessionsWithDetails = await Promise.all(
        (data || []).map(async (session) => {
          try {
            const participants = await getSessionParticipants(session.id);
            const registeredCount = participants.filter(p => p.status === 'registered').length;
            const totalSpots = session.max_players;

            let waitlistCount = 0;
            let waitlisted = false;
            if (user) {
              // Get current user waitlist info
              const [waitlistQuery, countQuery] = await Promise.all([
                supabase
                  .from('session_waitlist')
                  .select('*', { count: 'exact', head: false })
                  .eq('session_id', session.id)
                  .eq('user_id', user.id)
                  .maybeSingle(),
                supabase
                  .from('session_waitlist')
                  .select('*', { count: 'exact', head: true })
                  .eq('session_id', session.id)
              ]);
              waitlisted = !!waitlistQuery.data;
              waitlistCount = countQuery.count || 0;
            } else {
              // Just count
              const { count } = await supabase
                .from('session_waitlist')
                .select('*', { count: 'exact', head: true })
                .eq('session_id', session.id);
              waitlistCount = count || 0;
              waitlisted = false;
            }
            return {
              ...session,
              current_registrations: registeredCount,
              total_spots: totalSpots,
              is_full: registeredCount >= totalSpots,
              waitlisted,
              waitlist_count: waitlistCount,
            } as Session;
          } catch (err) {
            console.error('Error getting session detail for', session.id, err);
            return {
              ...session,
              current_registrations: 0,
              total_spots: session.max_players,
              is_full: false,
              waitlisted: false,
              waitlist_count: 0,
            } as Session;
          }
        })
      );
      setSessions(sessionsWithDetails);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [setSessions, setIsLoading, user]);
