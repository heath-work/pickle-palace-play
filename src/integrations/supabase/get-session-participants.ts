
import { supabase } from "./client";

// This function is a convenient wrapper around fetching session participants
export async function getSessionParticipants(sessionId: string) {
  try {
    console.log("Fetching session participants for session:", sessionId);
    
    // Get all registrations for this session using direct SQL query to bypass RLS
    const { data: registrations, error: regError } = await supabase
      .rpc('get_session_participants', { p_session_id: sessionId });
    
    if (regError) {
      console.error("Error fetching session registrations:", regError);
      throw regError;
    }

    if (!registrations || registrations.length === 0) {
      console.log("No registrations found for session:", sessionId);
      return [];
    }

    console.log("Found registrations:", registrations.length);
    console.log("Registrations data:", registrations);
    
    // Return the data directly from the RPC function
    return registrations;
  } catch (error) {
    console.error("Error in getSessionParticipants:", error);
    throw error;
  }
}
