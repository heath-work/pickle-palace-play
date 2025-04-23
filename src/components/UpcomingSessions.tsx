
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Session } from '@/types/sessions';
import { Link } from 'react-router-dom';

interface UpcomingSessionsProps {
  sessions: Session[];
  isLoading: boolean;
}

const UpcomingSessions = ({ sessions, isLoading }: UpcomingSessionsProps) => {
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-6">Upcoming Sessions</h2>
          <p className="text-center py-4">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Upcoming Sessions</h2>
          <Link to="/booking">
            <Button variant="outline">View All Sessions</Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {sessions.map((session) => (
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
                  <Link to="/booking" className="w-full">
                    <Button className="w-full">
                      Register Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingSessions;
