
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Users, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const SessionList = () => {
  const { sessions, userSessions, registerForSession, cancelSessionRegistration, isLoading } = useSessions();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredSessions = selectedFilter === 'my' 
    ? userSessions.map(us => us.session)
    : sessions;

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
              <CardHeader className="pb-2">
                <CardTitle>{session.title}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {session.courts?.name} - {session.courts?.type} Court
                </div>
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
                      {session.current_registrations || 0} / {session.max_players} registered
                    </span>
                  </div>
                  {session.skill_level && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">{session.skill_level} Level</Badge>
                    </div>
                  )}
                </div>

                {user && (
                  <div className="mt-4">
                    {!userSessions.some(us => us.session_id === session.id) ? (
                      <Button 
                        onClick={() => registerForSession(session.id)}
                        disabled={session.current_registrations >= session.max_players}
                        className="w-full"
                      >
                        {session.current_registrations >= session.max_players 
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
    </div>
  );
};

export default SessionList;
