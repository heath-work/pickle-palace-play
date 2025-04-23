
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session } from '@/types/sessions';

export const useEditSession = (fetchSessions: () => Promise<void>) => {
  // Updates the selected session
  return async (sessionId: string, data: Partial<Session>) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update(data)
        .eq('id', sessionId);

      if (error) {
        toast.error('Failed to update session');
        console.error('Edit session error:', error);
        return;
      }

      toast.success('Session updated');
      // Ensure we refresh the sessions list after updating
      await fetchSessions();
    } catch (err) {
      console.error('Edit session exception:', err);
      toast.error('An unexpected error occurred while updating the session');
    }
  };
};
