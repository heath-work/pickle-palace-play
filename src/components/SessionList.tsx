
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CreateSessionModal from './CreateSessionModal';
import { Court } from '@/types/supabase';
import { Session } from '@/types/sessions';
import { supabase } from '@/integrations/supabase/client';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/contexts/AuthContext';
import { SessionParticipantsModal } from "./SessionParticipantsModal";
import EditSessionModal from './EditSessionModal';
import { useDeleteSession } from '@/hooks/useDeleteSession';
import { useEditSession } from '@/hooks/useEditSession';

import {
  groupSessionsByWeek,
  getFounderFreeSessionCounts,
  WeeklyGroup
} from './sessionListUtils';

import { SessionWeeklyGroup } from './SessionWeeklyGroup';

function getAestDateString() {
  const now = new Date();
  const aestOffset = 10 * 60;
  const utcOffset = now.getTimezoneOffset();
  const totalOffsetMinutes = utcOffset + aestOffset;
  const aestNow = new Date(now.getTime() + totalOffsetMinutes * 60000);
  return aestNow.toISOString().split('T')[0];
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

  const handleSessionCreated = (_newSession: Session) => {
    fetchSessions();
  };
  const handleEditSave = async (data: Partial<Session>) => {
    if (editModal.session) {
      await editSession(editModal.session.id, data);
      setEditModal({ open: false, session: null });
    }
  };
  const handleDeleteSession = async (sessionId: string) => {
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
          .map(([weekKey, group]) => (
            <SessionWeeklyGroup
              key={weekKey}
              weekKey={weekKey}
              weekLabel={group.label}
              sessions={group.sessions}
              profile={profile}
              founderWeekCounts={founderWeekCounts}
              isFounder={profile?.membership_type === "Founder"}
              courts={courts}
              userSessions={userSessions}
              user={user}
              isAdmin={isAdmin}
              onEdit={(session) => setEditModal({ open: true, session })}
              onDelete={handleDeleteSession}
              onViewParticipants={(id) => setModalSessionId(id)}
              onRegister={registerForSession}
              onCancelRegistration={cancelSessionRegistration}
              onCancelWaitlist={cancelWaitlist}
            />
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
