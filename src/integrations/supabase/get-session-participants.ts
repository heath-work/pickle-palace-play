
import { supabase } from "./client";

// This function is a convenient wrapper around the get_session_participants RPC
export async function getSessionParticipants(sessionId: string) {
  try {
    console.log("Calling get_session_participants RPC for session:", sessionId);
    const { data, error } = await supabase.rpc('get_session_participants', {
      p_session_id: sessionId
    });
    
    if (error) {
      console.error("Error calling get_session_participants RPC:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getSessionParticipants:", error);
    throw error;
  }
}
