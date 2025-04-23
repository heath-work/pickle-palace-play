import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Users, MapPin, Trash2, Edit, DollarSign } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, getISOWeek, getYear } from 'date-fns';
import CreateSessionModal from './CreateSessionModal';
import { Court } from '@/types/supabase';
import { Session } from '@/types/sessions';
import { supabase } from '@/integrations/supabase/client';
import { SessionParticipantsModal } from "./SessionParticipantsModal";
import EditSessionModal from './EditSessionModal';
import { useDeleteSession } from '@/hooks/useDeleteSession';
import { useEditSession } from '@/hooks/useEditSession';

const SESSION_BASE_PRICE = 25;

function getAestDateString() {
  const now = new Date();
  const aestOffset = 10 * 60; // minutes
  const utcOffset = now.getTimezoneOffset();
  const totalOffsetMinutes = utcOffset + aestOffset;
  const aestNow = new Date(now.getTime() + totalOffsetMinutes * 60000);
  return aestNow.toISOString().split('T')[0];
}

function getSessionDiscount(profile) {
  if (!profile || !profile.membership_type) return 0;
  const type = profile.membership_type;
  if (type === 'Premium') return 0.15;
  if (type === 'Elite') return 0.25;
  if (type === 'Founder') return 0.33; // For display only, actual logic below
  return 0;
}

function getSessionWeekKey(session) {
  const sessionDate = parseISO(session.date);
  return `${getISOWeek(sessionDate)}-${getYear(sessionDate)}`;
}

function getWeekLabel(session) {
  const sessionDate = parseISO(session.date);
  const weekStart = startOfWeek(sessionDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(sessionDate, { weekStartsOn: 1 });
  return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
}

function groupSessionsByWeek(sessions) {
  return sessions.reduce((acc, session) => {
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

function getFounderFreeSessionCounts(userSessions) {
  const freeCountByWeek = {};
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

const SessionList = () => {
  const { sessions, userSessions, registerForSession, cancelSessionRegistration, cancelWaitlist, isLoading, fetchSessions } = useSessions();
  const { user, profile } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [courts, setCourts] = useState<Court[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalSessionId, setModalSessionId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean; session: Session | null }>({ open: false, session: null });

  const deleteSession = useDeleteSession(fetchSessions);
  const editSession = useEditSession(fetchSessions);

  useEffect(() => {
    const fetchCourts = async () => {
      const { data } = await supabase.from('courts').select('*');
      if (data) setCourts(data);
    };
    fetchCourts();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('session-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions'
        },
        (_) => {
          console.log('Session table changed, refreshing sessions...');
          fetchSessions();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSessions]);

  useEffect(() => {
    const channel = supabase
      .channel('session-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_registrations'
        },
        (_) => {
          fetchSessions();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSessions]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      console.log('Admin check result:', data);
      setIsAdmin(!!data);
    };
    checkAdminStatus();
  }, [user]);

  const aestDate = getAestDateString();
  const filteredSessions = (selectedFilter === 'my'
    ? userSessions.map(us => us.session as Session).filter(Boolean)
    : sessions
  ).filter((session) => session.date >= aestDate);

  const weeklyGroups = groupSessionsByWeek(filteredSessions);
  const founderWeekCounts =
    profile?.membership_type === "Founder"
      ? getFounderFreeSessionCounts(userSessions)
      : {};

  const handleSessionCreated = (newSession: Session) => {
    fetchSessions();
  };

  const handleEditSave = async (data: Partial<Session>) => {
    if (editModal.session) {
      await editSession(editModal.session.id, data);
      setEditModal({ open: false, session: null });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    console.log('Deleting session:', sessionId);
    await deleteSession(sessionId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('all')}
          >
            All Sessions
          </Button>
          <Button
            variant={selectedFilter === 'my' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('my')}
            disabled={!user}
          >
            My Sessions
          </Button>
        </div>
        {user && (
          <CreateSessionModal courts={courts} onSessionCreated={handleSessionCreated} />
        )}
      </div>

      {isLoading ? (
        <div>Loading sessions...</div>
      ) : Object.keys(weeklyGroups).length === 0 ? (
        <div className="text-center text-gray-500">
          No sessions available
        </div>
      ) : (
        Object.entries(weeklyGroups)
          .sort(([aKey, aVal], [bKey, bVal]) => {
            const aDate = parseISO(aVal.sessions[0].date);
            const bDate = parseISO(bVal.sessions[0].date);
            return aDate.getTime() - bDate.getTime();
          })
          .map(([weekKey, { label, sessions }]) => (
            <div key={weekKey} className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{label}</h3>
                {profile?.membership_type === "Founder" && (
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-900 rounded text-xs font-medium">
                    Free sessions used: {founderWeekCounts[weekKey] || 0} / 4
                  </span>
                )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session, idx) => {
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
                        priceString = 'Free (Founder bonus)';
                      } else {
                        priceString = `$${(SESSION_BASE_PRICE * (1 - 0.33)).toFixed(2)} (33% off)`;
                      }
                    }
                  }

                  return (
                    <Card key={session.id} className="hover:shadow-lg transition-shadow">
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
                              onClick={() => setEditModal({ open: true, session })}
                              aria-label="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSession(session.id)}
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
                              {format(parseISO(session.date), 'PPP')} at {session.start_time}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {(session.current_registrations || 0).toLocaleString()} / {(session.total_spots || session.max_players).toLocaleString()} registered
                              {isFull && <span className="ml-2 text-red-500 font-medium">(Full)</span>}
                              {session.waitlist_count > 0 && (
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
                            onClick={() => setModalSessionId(session.id)}
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
                                  if (registration) {
                                    cancelSessionRegistration(registration.id, session.id);
                                  }
                                }}
                                className="w-full"
                              >
                                Cancel Registration
                              </Button>
                            ) : isWaitlisted ? (
                              <Button
                                variant="outline"
                                onClick={() => cancelWaitlist(session.id)}
                                className="w-full"
                              >
                                Leave Waitlist
                              </Button>
                            ) : (
                              <Button
                                onClick={() => registerForSession(session.id)}
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
                })}
              </div>
            </div>
          ))
      )}
      {modalSessionId && (
        <SessionParticipantsModal
          sessionId={modalSessionId}
          open={!!modalSessionId}
          onOpenChange={(open) => setModalSessionId(open ? modalSessionId : null)}
        />
      )}
      {editModal.session && (
        <EditSessionModal
          session={editModal.session}
          open={editModal.open}
          onOpenChange={(open) =>
            setEditModal(open ? editModal : { open: false, session: null })
          }
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default SessionList;
