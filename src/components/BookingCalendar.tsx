
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

const BookingCalendar = ({ selectedDate, onDateSelect }: BookingCalendarProps) => {
  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      className={cn("rounded-md border shadow-sm", 
        "p-3 pointer-events-auto"
      )}
      disabled={(date) => {
        // Allow today and future dates, disable past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date < today;
      }}
      initialFocus
    />
  );
};

export default BookingCalendar;
