
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
        <div className="flex items-center gap-2 mb-4">
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Available Today</h2>
        </div>
        <ScrollArea className="h-[300px] pr-4">
          {courts.map((court) => (
            <div key={court.id} className="mb-6 last:mb-0">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{court.name}</h3>
              <div className="space-y-2">
                {availableTimeSlots[court.id]?.length > 0 ? (
                  availableTimeSlots[court.id].map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => onSessionSelect(court.id, slot.id)}
                      className="w-full flex items-center gap-3 p-3 text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors border border-border"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')}</span>
                      <span className="text-sm text-green-600 font-medium">Available</span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-2">No available slots today</p>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TodaySessions;
