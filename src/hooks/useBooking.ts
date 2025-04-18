
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Court, TimeSlot, Booking } from '@/types/supabase';

export type BookingDetails = {
  court_id: number | null;
  booking_date: Date | null;
  time_slot_id: number | null;
  duration_hours: number;
};

export function useBooking() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [courts, setCourts] = useState<Court[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [todayAvailableTimeSlots, setTodayAvailableTimeSlots] = useState<Record<number, TimeSlot[]>>({});
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    court_id: null,
    booking_date: null,
    time_slot_id: null,
    duration_hours: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  useEffect(() => {
    fetchCourtsAndTimeSlots();
  }, []);

  useEffect(() => {
    checkTodayAvailability();
  }, [courts, timeSlots]);

  const fetchCourtsAndTimeSlots = async () => {
    setIsLoading(true);
    try {
      const { data: courtsData, error: courtsError } = await supabase
        .from('courts')
        .select('*');

      if (courtsError) throw courtsError;

      const { data: timeSlotsData, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('*')
        .order('start_time');

      if (timeSlotsError) throw timeSlotsError;

      setCourts(courtsData as Court[] || []);
      setTimeSlots(timeSlotsData as TimeSlot[] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load booking data');
    } finally {
      setIsLoading(false);
    }
  };

  const checkTodayAvailability = async () => {
    if (!courts.length || !timeSlots.length) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const availabilityByCourt: Record<number, TimeSlot[]> = {};
    
    for (const court of courts) {
      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('court_id', court.id)
        .eq('booking_date', today);

      if (error) {
        console.error('Error checking availability:', error);
        continue;
      }

      const available = timeSlots.filter(slot => {
        const isSlotAvailable = !existingBookings?.some(booking => {
          return (
            booking.start_time <= slot.start_time && booking.end_time > slot.start_time ||
            booking.start_time < slot.end_time && booking.end_time >= slot.end_time ||
            slot.start_time <= booking.start_time && slot.end_time > booking.start_time
          );
        });
        return isSlotAvailable;
      });

      availabilityByCourt[court.id] = available;
    }

    setTodayAvailableTimeSlots(availabilityByCourt);
  };

  const checkAvailability = async (courtId: number, selectedDate: Date) => {
    setIsCheckingAvailability(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('court_id', courtId)
        .eq('booking_date', formattedDate);

      if (error) throw error;

      const available = timeSlots.filter(slot => {
        const isSlotAvailable = !existingBookings?.some(booking => {
          return (
            booking.start_time <= slot.start_time && booking.end_time > slot.start_time ||
            booking.start_time < slot.end_time && booking.end_time >= slot.end_time ||
            slot.start_time <= booking.start_time && slot.end_time > booking.start_time
          );
        });
        return isSlotAvailable;
      });

      setAvailableTimeSlots(available);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check court availability');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  return {
    date,
    courts,
    timeSlots,
    availableTimeSlots,
    todayAvailableTimeSlots,
    bookingDetails,
    isLoading,
    isCheckingAvailability,
    setDate,
    setBookingDetails,
    checkAvailability
  };
}
