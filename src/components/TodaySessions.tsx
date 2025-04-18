
import React from 'react';
import { format } from 'date-fns';
import { Court, TimeSlot } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TodaySessionsProps {
  courts: Court[];
  availableTimeSlots: Record<number, TimeSlot[]>;
  onSessionSelect: (courtId: number, timeSlotId: number) => void;
}

const TodaySessions = ({ courts, availableTimeSlots, onSessionSelect }: TodaySessionsProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Today's Sessions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courts.map((court) => (
          <Card key={court.id} className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">{court.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableTimeSlots[court.id]?.length > 0 ? (
                  availableTimeSlots[court.id].map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => onSessionSelect(court.id, slot.id)}
                      className="w-full p-2 text-left rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span>{format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')}</span>
                        <span className="text-green-600 text-sm">Available</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No available slots today</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TodaySessions;
