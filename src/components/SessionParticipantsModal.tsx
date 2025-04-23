
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSessionParticipants } from "@/integrations/supabase/get-session-participants";
import { supabase } from "@/integrations/supabase/client";

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
  // Adding registration timestamp property
  registration_time?: string;
};

// Waitlist participant type
type WaitlistParticipant = {
  id: string;
  user_id: string;
  created_at: string;
  position: number;
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
  const [waitlist, setWaitlist] = useState<WaitlistParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState<number>(0);

  useEffect(() => {
    if (!open) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch session info to get max_players
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("max_players")
          .eq("id", sessionId)
          .single();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          throw sessionError;
        }
        
        const maxPlayersLimit = sessionData?.max_players || 0;
        setMaxPlayers(maxPlayersLimit);
        console.log("Max players for session:", maxPlayersLimit);

        // Fetch registered participants
        const participantsData = await getSessionParticipants(sessionId);
        console.log("Fetched participants data:", participantsData);
        
        // Sort participants by registration time (using ID as a proxy since UUIDs have timestamp embedded)
        const sortedParticipants = Array.isArray(participantsData) 
          ? [...participantsData].sort((a, b) => a.id.localeCompare(b.id))
          : [];
        
        console.log("Sorted participants:", sortedParticipants);
        
        // Mark participants as registered or waitlisted based on maxPlayers
        const processedParticipants = sortedParticipants.map((p, index) => ({
          ...p,
          status: index < maxPlayersLimit ? 'registered' : 'waitlisted'
        }));
        
        setParticipants(processedParticipants);

        // Fetch waitlist
        const { data: waitlistRows, error: waitlistError } = await supabase
          .from("session_waitlist")
          .select("*")
          .eq("session_id", sessionId)
          .order("position", { ascending: true });
        
        if (waitlistError) {
          console.error("Error fetching waitlist:", waitlistError);
          throw waitlistError;
        }
        
        console.log("Fetched waitlist data:", waitlistRows);

        let waitlistWithUsername: WaitlistParticipant[] = [];
        if (waitlistRows && waitlistRows.length > 0) {
          const userIds = waitlistRows.map(wl => wl.user_id);
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", userIds);
            
          if (profilesError) {
            console.error("Error fetching profiles for waitlist:", profilesError);
            throw profilesError;
          }
          
          const userMap = new Map<string, string | null>();
          if (profiles) {
            profiles.forEach(profile => userMap.set(profile.id, profile.username));
          }
          
          waitlistWithUsername = waitlistRows.map((wl, idx) => ({
            ...wl,
            position: wl.position ?? (idx + 1),
            username: userMap.get(wl.user_id) || `User-${wl.user_id.substring(0, 6)}`
          }));
        }
        
        setWaitlist(waitlistWithUsername);
      } catch (error) {
        console.error("Error fetching participants or waitlist:", error);
        setParticipants([]);
        setWaitlist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
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
          <div className="space-y-4 max-h-[400px] overflow-auto">
            <div>
              <div className="font-semibold mb-1">Registered Participants</div>
              {participants.filter(p => p.status === 'registered').length === 0 ? (
                <div className="text-center text-gray-500 py-2">
                  No registered participants found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants
                      .filter(p => p.status === 'registered')
                      .map((p) => (
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
            <div>
              <div className="font-semibold mt-4 mb-1">Waitlist</div>
              {participants.filter(p => p.status === 'waitlisted').length === 0 && waitlist.length === 0 ? (
                <div className="text-center text-gray-400 py-2">
                  No users on the waitlist.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* First show automatically waitlisted participants */}
                    {participants
                      .filter(p => p.status === 'waitlisted')
                      .map((p, index) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            {p.username || p.user_id}
                            <span className="ml-2 text-xs text-gray-400">
                              ({p.user_id.slice(0, 8)}…)
                            </span>
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                        </TableRow>
                      ))}
                    {/* Then show users from the waitlist table */}
                    {waitlist.map((w, idx) => (
                      <TableRow key={w.id}>
                        <TableCell>
                          {w.username || w.user_id}
                          <span className="ml-2 text-xs text-gray-400">
                            ({w.user_id.slice(0, 8)}…)
                          </span>
                        </TableCell>
                        <TableCell>{participants.filter(p => p.status === 'waitlisted').length + w.position}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
