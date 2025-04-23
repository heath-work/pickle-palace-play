
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Users, MapPin, Trash2, Edit } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import CreateSessionModal from './CreateSessionModal';
import { Court } from '@/types/supabase';
import { Session } from '@/types/sessions';
import { supabase } from '@/integrations/supabase/client';
import { SessionParticipantsModal } from "./SessionParticipantsModal";
import EditSessionModal from './EditSessionModal';
import { useDeleteSession } from '@/hooks/useDeleteSession';
import { useEditSession } from '@/hooks/useEditSession';

function getAestDateString() {
  // Returns current date in 'YYYY-MM-DD' for AEST
  const now = new Date();
  const aestOffset = 10 * 60; // minutes
  const utcOffset = now.getTimezoneOffset();
  const totalOffsetMinutes = utcOffset + aestOffset;
  const aestNow = new Date(now.getTime() + totalOffsetMinutes * 60000);
  return aestNow.toISOString().split('T')[0];
}

const SessionList = () => {
  const { sessions, userSessions, registerForSession, cancelSessionRegistration, isLoading, fetchSessions } = useSessions();
  const { user } = useAuth();
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
      setIsAdmin(!!data);
    };
    checkAdminStatus();
  }, [user]);

  // FILTER: Hide sessions in the past (AEST)
  const aestDate = getAestDateString();
  const filteredSessions = (selectedFilter === 'my' 
    ? userSessions.map(us => us.session as Session).filter(Boolean)
    : sessions
  ).filter((session) => session.date >= aestDate);

  const handleSessionCreated = (newSession: Session) => {
    fetchSessions();
  };

  // Handler for saving session edits
  const handleEditSave = async (data: Partial<Session>) => {
    if (editModal.session) {
      await editSession(editModal.session.id, data);
      setEditModal({ open: false, session: null });
    }
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
      ) : filteredSessions.length === 0 ? (
        <div className="text-center text-gray-500">
          No sessions available
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
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
                      onClick={() => deleteSession(session.id)}
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
                    </span>
                  </div>
                  {session.skill_level && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">{session.skill_level} Level</Badge>
                    </div>
                  )}
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
                    {!userSessions.some(us => us.session_id === session.id) ? (
                      <Button
                        onClick={() => registerForSession(session.id)}
                        disabled={(session.current_registrations || 0) >= (session.total_spots || session.max_players)}
                        className="w-full"
                      >
                        {(session.current_registrations || 0) >= (session.total_spots || session.max_players)
                          ? 'Waitlist'
                          : 'Register'}
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const registration = userSessions.find(us => us.session_id === session.id);
                          if (registration) {
                            cancelSessionRegistration(registration.id);
                          }
                        }}
                        className="w-full"
                      >
                        Cancel Registration
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
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
