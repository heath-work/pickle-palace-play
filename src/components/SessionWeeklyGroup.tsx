
import React from "react";
import { Session } from "@/types/sessions";
import { SessionCard } from "./SessionCard";

interface SessionWeeklyGroupProps {
  weekKey: string;
  weekLabel: string;
  sessions: Session[];
  profile: any;
  founderWeekCounts: Record<string, number>;
  isFounder: boolean;
  courts: any[];
  userSessions: any[];
  user: any;
  isAdmin: boolean;
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
  onViewParticipants: (sessionId: string) => void;
  onRegister: (sessionId: string) => void;
  onCancelRegistration: (registrationId: string, sessionId?: string) => void;
  onCancelWaitlist: (sessionId: string) => void;
}

export const SessionWeeklyGroup: React.FC<SessionWeeklyGroupProps> = ({
  weekKey,
  weekLabel,
  sessions,
  profile,
  founderWeekCounts,
  isFounder,
  courts,
  userSessions,
  user,
  isAdmin,
  onEdit,
  onDelete,
  onViewParticipants,
  onRegister,
  onCancelRegistration,
  onCancelWaitlist,
}) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold">{weekLabel}</h3>
      {isFounder && (
        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-900 rounded text-xs font-medium">
          Free sessions used: {founderWeekCounts[weekKey] || 0} / 4
        </span>
      )}
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session, idx) => (
        <SessionCard
          key={session.id}
          session={session}
          courts={courts}
          profile={profile}
          userSessions={userSessions}
          user={user}
          isAdmin={isAdmin}
          founderWeekCounts={founderWeekCounts}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewParticipants={onViewParticipants}
          onRegister={onRegister}
          onCancelRegistration={onCancelRegistration}
          onCancelWaitlist={onCancelWaitlist}
        />
      ))}
    </div>
  </div>
);
