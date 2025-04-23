
import { supabase } from "./client";

// This function is a convenient wrapper around fetching session participants
export async function getSessionParticipants(sessionId: string) {
  try {
    console.log("Fetching session participants for session:", sessionId);
    
    // First, get all registrations for this session - use simple query without joins
    const { data: registrations, error: regError } = await supabase
      .from('session_registrations')
      .select('*')  // Select all fields
      .eq('session_id', sessionId)
      .not('status', 'eq', 'cancelled');
    
    if (regError) {
      console.error("Error fetching session registrations:", regError);
      throw regError;
    }

    if (!registrations || registrations.length === 0) {
      console.log("No registrations found for session:", sessionId);
      return [];
    }

    console.log("Found registrations:", registrations.length);

    // Get all user IDs to fetch profiles
    const userIds = registrations.map(reg => reg.user_id);
    
    // Fetch profile data for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    // Create a map of user IDs to usernames for quick lookup
    const userMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        userMap.set(profile.id, profile.username);
      });
    }

    // Combine registration data with profile data
    const participants = registrations.map(reg => ({
      id: reg.id,
      user_id: reg.user_id,
      status: reg.status,
      username: userMap.get(reg.user_id) || `User-${reg.user_id.substring(0, 6)}`
    }));
    
    console.log("Processed participants:", participants);
    return participants;
  } catch (error) {
    console.error("Error in getSessionParticipants:", error);
    throw error;
  }
}
