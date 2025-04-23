
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface SessionParticipantsModalProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Participant = {
  id: string;
  user_id: string;
  status: string;
  user: {
    email: string | null;
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
      // Fetch all session_registrations (not cancelled) and get user info
      const { data, error } = await supabase
        .from("session_registrations")
        .select("id, user_id, status, user:profiles(email, id)")
        .eq("session_id", sessionId)
        .not("status", "eq", "cancelled");

      if (error) {
        setParticipants([]);
      } else {
        setParticipants(data || []);
      }
      setLoading(false);
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
                      {p.user?.email || p.user_id}
                      <span className="ml-2 text-xs text-gray-400">({p.user?.id?.slice(0, 8)}…)</span>
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
