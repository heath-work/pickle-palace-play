
import { supabase } from "./client";

// Define the return type for our RPC function
export type SessionParticipant = {
  id: string;
  user_id: string;
  status: string;
  username: string | null;
};

// This function is a convenient wrapper around fetching session participants
export async function getSessionParticipants(sessionId: string) {
  try {
    console.log("Fetching session participants for session:", sessionId);

    // Call the RPC function with the correct parameter name (p_session_id)
    const { data, error } = await supabase.rpc(
      'get_session_participants',
      { p_session_id: sessionId }
    );

    if (error) {
      console.error("Error fetching session participants:", error);
      throw error;
    }

    if (!Array.isArray(data) || data.length === 0) {
      console.log("No participants found for session:", sessionId);
      return [];
    }

    console.log("Found participants:", data.length);
    console.log("Participants data:", data);

    // Cast the data to our expected type
    return data as SessionParticipant[];
  } catch (error) {
    console.error("Error in getSessionParticipants:", error);
    throw error;
  }
}
