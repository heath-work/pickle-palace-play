import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import BookingCalendar from './BookingCalendar';
import TodaySessions from './TodaySessions';
import { Court, TimeSlot, Booking } from '@/types/supabase';

type BookingDetails = {
  court_id: number | null;
  booking_date: Date | null;
  time_slot_id: number | null;
  duration_hours: number;
};

const BookingSystem = () => {
  const { user } = useAuth();
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

    fetchCourtsAndTimeSlots();
  }, []);

  useEffect(() => {
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

    checkTodayAvailability();
  }, [courts, timeSlots]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setBookingDetails(prev => ({
      ...prev,
      booking_date: selectedDate || null,
      time_slot_id: null
    }));
  };

  const handleCourtSelect = (courtId: string) => {
    setBookingDetails(prev => ({
      ...prev,
      court_id: parseInt(courtId),
      time_slot_id: null
    }));
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setBookingDetails(prev => ({
      ...prev,
      time_slot_id: parseInt(timeSlotId)
    }));
  };

  const handleDurationSelect = (duration: string) => {
    setBookingDetails(prev => ({
      ...prev,
      duration_hours: parseInt(duration)
    }));
  };

  const handleSessionSelect = (courtId: number, timeSlotId: number) => {
    const today = new Date();
    setDate(today);
    setBookingDetails(prev => ({
      ...prev,
      court_id: courtId,
      booking_date: today,
      time_slot_id: timeSlotId
    }));
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book a court');
      return;
    }

    if (!bookingDetails.court_id || !bookingDetails.booking_date || !bookingDetails.time_slot_id) {
      toast.error('Please select a date, court, and time slot');
      return;
    }

    setIsLoading(true);
    try {
      const selectedTimeSlot = timeSlots.find(slot => slot.id === bookingDetails.time_slot_id);
      if (!selectedTimeSlot) {
        throw new Error('Selected time slot not found');
      }

      const [startHours, startMinutes] = selectedTimeSlot.start_time.split(':').map(Number);
      const endHours = startHours + bookingDetails.duration_hours;
      const endTime = `${endHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`;

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          court_id: bookingDetails.court_id,
          booking_date: format(bookingDetails.booking_date, 'yyyy-MM-dd'),
          start_time: selectedTimeSlot.start_time,
          end_time: endTime,
          duration_hours: bookingDetails.duration_hours
        });

      if (error) throw error;

      toast.success('Court booked successfully!', {
        description: `You have booked ${courts.find(c => c.id === bookingDetails.court_id)?.name} on ${format(bookingDetails.booking_date, 'PPP')} at ${selectedTimeSlot.start_time.substring(0, 5)}`,
      });

      setDate(undefined);
      setBookingDetails({
        court_id: null,
        booking_date: null,
        time_slot_id: null,
        duration_hours: 1
      });
    } catch (error: any) {
      console.error('Error booking court:', error);
      toast.error(error.message || 'Failed to book court');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedCourtName = () => {
    if (!bookingDetails.court_id) return '';
    const court = courts.find(c => c.id === bookingDetails.court_id);
    return court ? `${court.name} (${court.type})` : '';
  };

  const getSelectedTimeSlot = () => {
    if (!bookingDetails.time_slot_id) return '';
    const timeSlot = timeSlots.find(t => t.id === bookingDetails.time_slot_id);
    return timeSlot ? timeSlot.start_time.substring(0, 5) : '';
  };

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Book a Court
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Reserve your court time in just a few clicks.
          </p>
        </div>

        <TodaySessions 
          courts={courts}
          availableTimeSlots={todayAvailableTimeSlots}
          onSessionSelect={handleSessionSelect}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Select Date</h3>
            <BookingCalendar 
              selectedDate={date}
              onDateSelect={handleDateSelect}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            {!user && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>
                  Please <a href="/auth/signin" className="underline font-semibold">sign in</a> to book a court.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Court
                </label>
                <Select
                  value={bookingDetails.court_id?.toString() || ''}
                  onValueChange={handleCourtSelect}
                  disabled={isLoading || !date}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a court" />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id.toString()}>
                        {court.name} ({court.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time Slot
                </label>
                <Select
                  value={bookingDetails.time_slot_id?.toString() || ''}
                  onValueChange={handleTimeSlotSelect}
                  disabled={isLoading || !date || !bookingDetails.court_id || isCheckingAvailability}
                >
                  <SelectTrigger className="w-full">
                    {isCheckingAvailability ? (
                      <div className="flex items-center">
                        <Clock className="animate-spin h-4 w-4 mr-2" />
                        <span>Checking availability...</span>
                      </div>
                    ) : (
                      <SelectValue placeholder="Select a time slot" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.length === 0 ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        No time slots available
                      </div>
                    ) : (
                      availableTimeSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id.toString()}>
                          {slot.start_time.substring(0, 5)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (hours)
                </label>
                <Select
                  value={bookingDetails.duration_hours.toString()}
                  onValueChange={handleDurationSelect}
                  disabled={isLoading || !date || !bookingDetails.court_id || !bookingDetails.time_slot_id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full bg-pickleball-blue hover:bg-blue-600" 
                onClick={handleBooking}
                disabled={isLoading || !user || !date || !bookingDetails.court_id || !bookingDetails.time_slot_id}
              >
                {isLoading ? 'Processing...' : 'Book Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSystem;
