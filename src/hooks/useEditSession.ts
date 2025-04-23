
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session } from '@/types/sessions';

export const useEditSession = (fetchSessions: () => Promise<void>) => {
  // Updates the selected session
  return async (sessionId: string, data: Partial<Session>) => {
    try {
      console.log('Updating session with ID:', sessionId);
      console.log('Update data:', data);
      
      // Perform the update operation
      const { error, data: updatedData } = await supabase
        .from('sessions')
        .update(data)
        .eq('id', sessionId)
        .select();

      if (error) {
        toast.error('Failed to update session');
        console.error('Edit session error:', error);
        return;
      }

      console.log('Session updated successfully:', updatedData);
      toast.success('Session updated');
      
      // Refresh sessions list immediately
      fetchSessions();
    } catch (err) {
      console.error('Edit session exception:', err);
      toast.error('An unexpected error occurred while updating the session');
    }
  };
};
