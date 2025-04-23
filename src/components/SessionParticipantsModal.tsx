
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Props for the modal
interface SessionParticipantsModalProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Participant type definition
type Participant = {
  id: string;
  user_id: string;
  status: string;
  username: string | null;
};

const statusColors: Record<string, string> = {
  registered: "bg-green-500",
  waitlisted: "bg-yellow-400",
  cancelled: "bg-red-500",
};

export const SessionParticipantsModal: React.FC<SessionParticipantsModalProps> = ({
  sessionId,
  open,
  onOpenChange,
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    
    const fetchParticipants = async () => {
      setLoading(true);
      try {
        console.log("Fetching participants for session:", sessionId);
        
        // Using a raw SQL query with joins to get all the data we need in one go
        const { data, error } = await supabase.rpc('get_session_participants', {
          p_session_id: sessionId
        });

        if (error) {
          console.error("Error calling get_session_participants:", error);
          // Fallback method if RPC fails
          await fetchParticipantsFallback();
          return;
        }

        console.log("Participants data from RPC:", data);
        setParticipants(data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error in fetchParticipants:", error);
        // Use fallback method
        await fetchParticipantsFallback();
      }
    };

    const fetchParticipantsFallback = async () => {
      try {
        console.log("Using fallback method to fetch participants");
        
        // Get all registrations for this session
        const { data: registrations, error: regError } = await supabase
          .from("session_registrations")
          .select("*")
          .eq("session_id", sessionId)
          .not("status", "eq", "cancelled");

        if (regError) {
          console.error("Fallback error fetching registrations:", regError);
          setParticipants([]);
          setLoading(false);
          return;
        }

        if (!registrations || registrations.length === 0) {
          console.log("No registrations found for session:", sessionId);
          setParticipants([]);
          setLoading(false);
          return;
        }

        console.log("Found registrations:", registrations.length);

        // Create a list of user IDs from the registrations
        const userIds = registrations.map(reg => reg.user_id);
        
        // Fetch all profiles for these users in a single query
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        if (profilesError) {
          console.error("Fallback error fetching profiles:", profilesError);
        }

        // Create a map of user IDs to usernames for quick lookup
        const userMap = new Map();
        if (profiles) {
          profiles.forEach(profile => {
            userMap.set(profile.id, profile.username);
          });
        }

        // Combine registration data with profile data
        const combinedParticipants = registrations.map(reg => ({
          id: reg.id,
          user_id: reg.user_id,
          status: reg.status,
          username: userMap.get(reg.user_id) || null
        }));

        console.log("Combined participants:", combinedParticipants);
        setParticipants(combinedParticipants);
        setLoading(false);
      } catch (error) {
        console.error("Error in fetchParticipantsFallback:", error);
        setParticipants([]);
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [open, sessionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Event Participants</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading...
          </div>
        ) : (
          <div className="space-y-2 max-h-[350px] overflow-auto">
            {participants.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No registered participants found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.username || p.user_id}
                        <span className="ml-2 text-xs text-gray-400">
                          ({p.user_id.slice(0, 8)}…)
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={statusColors[p.status] + " capitalize"}>
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
