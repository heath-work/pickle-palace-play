
import { supabase } from "./client";

// This function is a convenient wrapper around the get_session_participants RPC
export async function getSessionParticipants(sessionId: string) {
  try {
    console.log("Calling get_session_participants RPC for session:", sessionId);
    
    // Using a raw query to call the RPC function since TypeScript doesn't know about our custom function
    const { data, error } = await supabase
      .from('session_registrations')
      .select(`
        id,
        user_id,
        status,
        profiles:user_id(username)
      `)
      .eq('session_id', sessionId)
      .not('status', 'eq', 'cancelled');
    
    if (error) {
      console.error("Error fetching session participants:", error);
      throw error;
    }
    
    // Transform the data to match the Participant type
    const participants = data?.map(item => ({
      id: item.id,
      user_id: item.user_id,
      status: item.status,
      username: item.profiles?.username || null
    })) || [];
    
    console.log("Transformed participants:", participants);
    return participants;
  } catch (error) {
    console.error("Error in getSessionParticipants:", error);
    throw error;
  }
}
