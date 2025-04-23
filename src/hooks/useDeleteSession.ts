
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteSession = (fetchSessions: () => Promise<void>) => {
  // Deletes the specified session and refreshes session list
  return async (sessionId: string) => {
    try {
      console.log('Deleting session with ID:', sessionId);
      
      // First attempt to check if the session exists
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
      
      // Perform the delete operation
      const { error, data } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)
        .select();

      if (error) {
        toast.error('Failed to delete session');
        console.error('Delete session error:', error);
        return;
      }

      console.log('Session deleted successfully:', data);
      toast.success('Session deleted');
      
      // Force refresh sessions list
      setTimeout(() => {
        fetchSessions();
      }, 500);
    } catch (err) {
      console.error('Delete session exception:', err);
      toast.error('An unexpected error occurred while deleting the session');
    }
  };
};
