
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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
  profile?: {
    username: string | null;
    id: string;
  } | null;
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
    setLoading(true);

    const fetchParticipants = async () => {
      try {
        // First fetch all session_registrations
        const { data: registrations, error: regError } = await supabase
          .from("session_registrations")
          .select("id, user_id, status")
          .eq("session_id", sessionId)
          .not("status", "eq", "cancelled");

        if (regError) {
          console.error("Error fetching registrations:", regError);
          setParticipants([]);
          setLoading(false);
          return;
        }

        // Now get the user profiles separately
        const participantsWithProfiles = await Promise.all(
          (registrations || []).map(async (reg) => {
            // Get user profile from the profiles table
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("id, username")
              .eq("id", reg.user_id)
              .maybeSingle();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
              return {
                ...reg,
                profile: null
              };
            }

            return {
              ...reg,
              profile: profile
            };
          })
        );

        setParticipants(participantsWithProfiles);
      } catch (error) {
        console.error("Error in fetchParticipants:", error);
        setParticipants([]);
      } finally {
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
              <ul className="divide-y divide-gray-200">
                {participants.map((p) => (
                  <li key={p.id} className="py-2 flex items-center justify-between">
                    <div>
                      {p.profile?.username || p.user_id}
                      <span className="ml-2 text-xs text-gray-400">({p.profile?.id?.slice(0, 8) ?? p.user_id.slice(0,8)}…)</span>
                    </div>
                    <Badge className={statusColors[p.status] + " capitalize"}>
                      {p.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
