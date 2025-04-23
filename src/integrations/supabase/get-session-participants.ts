
import { supabase } from "./client";

// Define the return type for our RPC function
export type SessionParticipant = {
  id: string;
  name: string;
  email: string;
};

// This function is a convenient wrapper around fetching session participants
export async function getSessionParticipants(sessionId: string) {
  try {
    console.log("Fetching session participants for session:", sessionId);

    // Call the RPC with correct type params and argument shape
    const { data, error } = await supabase
      .rpc<SessionParticipant[], { session_id: string }>("get_session_participants", {
        session_id: sessionId,
      });

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

    return data;
  } catch (error) {
    console.error("Error in getSessionParticipants:", error);
    throw error;
  }
}
