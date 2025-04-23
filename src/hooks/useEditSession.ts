
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Session } from '@/types/sessions';

export const useEditSession = (fetchSessions: () => Promise<void>) => {
  // Updates the selected session
  return async (sessionId: string, data: Partial<Session>) => {
    try {
      console.log('Updating session with ID:', sessionId);
      console.log('Update data:', data);
      
      // First check if the session exists
      const { data: checkData, error: checkError } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', sessionId)
        .single();
        
      if (checkError) {
        console.error('Session check error:', checkError);
        toast.error('Unable to find session');
        return;
      }
      
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
      
      // Force refresh sessions list
      setTimeout(() => {
        fetchSessions();
      }, 500);
    } catch (err) {
      console.error('Edit session exception:', err);
      toast.error('An unexpected error occurred while updating the session');
    }
  };
};
