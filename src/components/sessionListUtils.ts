
import { parseISO, format, startOfWeek, endOfWeek, getISOWeek, getYear, isWithinInterval } from 'date-fns';
import { Session, SessionRegistration } from "@/types/sessions";

export interface WeeklyGroup {
  label: string;
  sessions: Session[];
}

export function getSessionWeekKey(session: Session) {
  const sessionDate = parseISO(session.date);
  return `${getISOWeek(sessionDate)}-${getYear(sessionDate)}`;
}

export function getWeekLabel(session: Session) {
  const sessionDate = parseISO(session.date);
  const weekStart = startOfWeek(sessionDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(sessionDate, { weekStartsOn: 1 });
  return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
}

export function groupSessionsByWeek(sessions: Session[]): Record<string, WeeklyGroup> {
  return sessions.reduce((acc: Record<string, WeeklyGroup>, session) => {
    const key = getSessionWeekKey(session);
    if (!acc[key]) {
      acc[key] = {
        label: getWeekLabel(session),
        sessions: [],
      };
    }
    acc[key].sessions.push(session);
    return acc;
  }, {});
}

export function getFounderFreeSessionCounts(userSessions: SessionRegistration[]) {
  const freeCountByWeek: Record<string, any[]> = {};
  userSessions.forEach(us => {
    if (us.status === "registered" && us.session?.date) {
      const key = getSessionWeekKey(us.session);
      if (!freeCountByWeek[key]) freeCountByWeek[key] = [];
      freeCountByWeek[key].push(us);
    }
  });
  Object.keys(freeCountByWeek).forEach(key => {
    freeCountByWeek[key] = freeCountByWeek[key]
      .sort((a, b) => {
        if (!a.session?.date || !b.session?.date) return 0;
        return a.session.date.localeCompare(b.session.date);
      })
      .slice(0, 4);
  });
  return Object.fromEntries(
    Object.entries(freeCountByWeek).map(([k, arr]) => [k, arr.length])
  );
}
