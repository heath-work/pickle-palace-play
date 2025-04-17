
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/supabase';

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

const BookingCalendar = ({ selectedDate, onDateSelect }: BookingCalendarProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');
      
      if (!error && data) {
        setBookings(data as Booking[]);
      }
    };

    fetchBookings();
  }, []);

  // Create an array of dates that have bookings
  const bookedDates = bookings.map(booking => new Date(booking.booking_date));

  const isDayBooked = (day: Date) => {
    return bookedDates.some(bookedDate => 
      format(bookedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onDateSelect}
      className={cn("w-full border rounded-lg", 
        "p-3 pointer-events-auto"
      )}
      modifiers={{
        booked: bookedDates,
      }}
      modifiersStyles={{
        booked: {
          backgroundColor: '#E5DEFF',
          color: '#1A1F2C',
          fontWeight: 'bold'
        }
      }}
      disabled={(date) => date < new Date()}
      initialFocus
    />
  );
};

export default BookingCalendar;
