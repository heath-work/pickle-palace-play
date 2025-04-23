
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDeleteSession = (fetchSessions: () => Promise<void>) => {
  // Deletes the specified session and refreshes session list
  return async (sessionId: string) => {
    try {
      console.log('Deleting session with ID:', sessionId);
      
      // Perform the delete operation
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        toast.error('Failed to delete session');
        console.error('Delete session error:', error);
        return;
      }

      console.log('Session deleted successfully');
      toast.success('Session deleted');
      
      // Refresh sessions list immediately
      await fetchSessions();
    } catch (err) {
      console.error('Delete session exception:', err);
      toast.error('An unexpected error occurred while deleting the session');
    }
  };
};
