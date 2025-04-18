
import React from 'react';
import { format } from 'date-fns';
import { Court, TimeSlot } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CalendarClock } from 'lucide-react';

interface TodaySessionsProps {
  courts: Court[];
  availableTimeSlots: Record<number, TimeSlot[]>;
  onSessionSelect: (courtId: number, timeSlotId: number) => void;
}

const TodaySessions = ({ courts, availableTimeSlots, onSessionSelect }: TodaySessionsProps) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Available Today</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courts.map((court) => (
              <div key={court.id} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground px-2">{court.name}</h3>
                <div className="space-y-1">
                  {availableTimeSlots[court.id]?.length > 0 ? (
                    availableTimeSlots[court.id].map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => onSessionSelect(court.id, slot.id)}
                        className="w-full flex items-center gap-2 p-2 text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="flex-1">{format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')}</span>
                        <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-full">
                          Available
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground px-2 py-1">No available slots</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TodaySessions;
