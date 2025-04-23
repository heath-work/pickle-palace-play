
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, MapPin, DollarSign, Trash2, Edit } from "lucide-react";
import { parseISO, format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { Session, SessionRegistration } from "@/types/sessions";

interface SessionCardProps {
  session: Session;
  courts: any[];
  profile: any;
  userSessions: SessionRegistration[];
  user: any;
  isAdmin: boolean;
  founderWeekCounts: Record<string, number>;
  onEdit: (session: Session) => void;
  onDelete: (sessionId: string) => void;
  onViewParticipants: (sessionId: string) => void;
  onRegister: (sessionId: string) => void;
  onCancelRegistration: (registrationId: string, sessionId?: string) => void;
  onCancelWaitlist: (sessionId: string) => void;
}

const SESSION_BASE_PRICE = 25;

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  userSessions,
  profile,
  user,
  isAdmin,
  onEdit,
  onDelete,
  onViewParticipants,
  onRegister,
  onCancelRegistration,
  onCancelWaitlist
}) => {
  const isFull = (session.current_registrations || 0) >= (session.total_spots || session.max_players);
  const isRegistered = userSessions.some(us => us.session_id === session.id);
  const isWaitlisted = session.waitlisted;

  let priceString = `$${SESSION_BASE_PRICE}`;
  if (profile) {
    const type = profile.membership_type;
    if (type === 'Premium') {
      priceString = `$${(SESSION_BASE_PRICE * (1 - 0.15)).toFixed(2)} (15% off)`;
    } else if (type === 'Elite') {
      priceString = `$${(SESSION_BASE_PRICE * (1 - 0.25)).toFixed(2)} (25% off)`;
    } else if (type === 'Founder') {
      let userRegisteredThisWeek = userSessions
        .filter(us => us.status === "registered" && us.session)
        .sort((a, b) => {
          if (!a.session?.date || !b.session?.date) return 0;
          return a.session.date.localeCompare(b.session.date);
        });
      let thisSessionIsFree = false;
      if (userRegisteredThisWeek.length > 0) {
        const sessionDate = parseISO(session.date);
        const weekStart = startOfWeek(sessionDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(sessionDate, { weekStartsOn: 1 });
        const weekSess = userRegisteredThisWeek.filter(us => {
          if (!us.session?.date) return false;
          const date = parseISO(us.session.date);
          return isWithinInterval(date, { start: weekStart, end: weekEnd });
        });
        const freeSessionIds = weekSess.slice(0, 4).map(us => us.session_id);
        if (isRegistered && freeSessionIds.includes(session.id)) {
          thisSessionIsFree = true;
        }
      }
      if (isRegistered && thisSessionIsFree) {
        priceString = "Free (Founder bonus)";
      } else {
        priceString = `$${(SESSION_BASE_PRICE * (1 - 0.33)).toFixed(2)} (33% off)`;
      }
    }
  }
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle>{session.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {session.courts?.name} - {session.courts?.type} Court
          </div>
        </div>
        {isAdmin && (
          <div className="flex flex-row gap-2 items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(session)}
              aria-label="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(session.id)}
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(parseISO(session.date), "PPP")} at {session.start_time}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {(session.current_registrations || 0).toLocaleString()} / {(session.total_spots || session.max_players).toLocaleString()} registered
              {isFull && <span className="ml-2 text-red-500 font-medium">(Full)</span>}
              {session.waitlist_count && session.waitlist_count > 0 && (
                <span className="ml-2 text-amber-600 font-medium">
                  ({session.waitlist_count} waitlisted)
                </span>
              )}
            </span>
          </div>
          {session.skill_level && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">{session.skill_level} Level</Badge>
            </div>
          )}
          <div className="flex items-center space-x-2 mt-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-gray-900">
              {priceString}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <Button
            variant="secondary"
            className="w-full mb-2"
            onClick={() => onViewParticipants(session.id)}
          >
            View Participants
          </Button>
        </div>
        {user && (
          <div className="mt-2">
            {isRegistered ? (
              <Button
                variant="destructive"
                onClick={() => {
                  const registration = userSessions.find(us => us.session_id === session.id);
                  if (registration) onCancelRegistration(registration.id, session.id);
                }}
                className="w-full"
              >
                Cancel Registration
              </Button>
            ) : isWaitlisted ? (
              <Button
                variant="outline"
                onClick={() => onCancelWaitlist(session.id)}
                className="w-full"
              >
                Leave Waitlist
              </Button>
            ) : (
              <Button
                onClick={() => onRegister(session.id)}
                className="w-full"
                variant={isFull ? "outline" : "default"}
              >
                {isFull ? "Join Waitlist" : "Register"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
