
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session } from '@/types/sessions';

export const useEditSession = (fetchSessions: () => Promise<void>) => {
  // Updates the selected session
  return async (sessionId: string, data: Partial<Session>) => {
    const { error } = await supabase
      .from('sessions')
      .update(data)
      .eq('id', sessionId);

    if (error) {
      toast.error('Failed to update session');
      return;
    }

    toast.success('Session updated');
    await fetchSessions();
  };
};
