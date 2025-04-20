
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useBooking } from '@/hooks/useBooking';
import TodaySessions from './TodaySessions';
import BookingForm from './BookingForm';
import BookingCalendar from './BookingCalendar';
import { Badge } from '@/components/ui/badge';

const BookingSystem = () => {
  const { user, profile, refreshProfile } = useAuth();
  const {
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
  } = useBooking();

  // Ensure we have the latest profile data when component mounts
  useEffect(() => {
    if (user) {
      console.log('BookingSystem: Refreshing profile data on mount');
      refreshProfile(user.id);
    }
  }, [user]);

  // Debug log for profile information
  useEffect(() => {
    if (profile) {
      console.log('Current profile in BookingSystem:', {
        id: profile.id,
        username: profile.username,
        membership_type: profile.membership_type || 'No membership type found'
      });
    } else {
      console.log('BookingSystem: No profile data available');
    }
  }, [profile]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setBookingDetails(prev => ({
      ...prev,
      booking_date: selectedDate || null,
      time_slot_id: null
    }));
    
    if (selectedDate && bookingDetails.court_id) {
      checkAvailability(bookingDetails.court_id, selectedDate);
    }
  };

  const handleCourtSelect = (courtId: string) => {
    const parsedCourtId = parseInt(courtId);
    setBookingDetails(prev => ({
      ...prev,
      court_id: parsedCourtId,
      time_slot_id: null
    }));
    
    if (date && parsedCourtId) {
      checkAvailability(parsedCourtId, date);
    }
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

    const selectedTimeSlot = timeSlots.find(slot => slot.id === bookingDetails.time_slot_id);
    if (!selectedTimeSlot) {
      toast.error('Selected time slot not found');
      return;
    }

    const [startHours, startMinutes] = selectedTimeSlot.start_time.split(':').map(Number);
    const endHours = startHours + bookingDetails.duration_hours;
    const endTime = `${endHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`;

    try {
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
    }
  };

  // Get membership discount information based on user's membership type
  const getMembershipDiscount = () => {
    if (!profile) {
      console.log('No profile available for discount calculation');
      return null;
    }
    
    if (!profile.membership_type) {
      console.log('No membership_type in profile for discount calculation');
      return null;
    }
    
    console.log(`Calculating discount for membership type: ${profile.membership_type}`);
    
    const discounts: {[key: string]: string} = {
      "Premium": "10%",
      "Elite": "15%",
      "Founder": "25%"
    };
    
    return discounts[profile.membership_type] || null;
  };

  const membershipDiscount = getMembershipDiscount();
  console.log('Calculated membership discount:', membershipDiscount);

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Date</h3>
                <BookingCalendar
                  selectedDate={date}
                  onDateSelect={handleDateSelect}
                />
              </div>
              <div>
                <BookingForm
                  date={date}
                  courts={courts}
                  timeSlots={timeSlots}
                  availableTimeSlots={availableTimeSlots}
                  bookingDetails={bookingDetails}
                  isLoading={isLoading}
                  isCheckingAvailability={isCheckingAvailability}
                  onDateSelect={handleDateSelect}
                  onCourtSelect={handleCourtSelect}
                  onTimeSlotSelect={handleTimeSlotSelect}
                  onDurationSelect={handleDurationSelect}
                  onBookingSubmit={handleBooking}
                />
              </div>
            </div>
            
            <div className="w-full">
              <TodaySessions 
                courts={courts}
                availableTimeSlots={todayAvailableTimeSlots}
                onSessionSelect={handleSessionSelect}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Information</h3>
              {user && (
                <div className="mb-4 flex items-center">
                  <span className="font-medium mr-2">Membership:</span>
                  {profile ? (
                    <div className="flex flex-col">
                      <Badge className={
                        profile.membership_type === "Founder" ? "bg-purple-600" :
                        profile.membership_type === "Elite" ? "bg-emerald-600" :
                        profile.membership_type === "Premium" ? "bg-blue-600" :
                        profile.membership_type === "Basic" ? "bg-gray-600" :
                        "bg-gray-400"
                      }>
                        {profile.membership_type || 'None'}
                      </Badge>
                      {membershipDiscount && (
                        <span className="text-sm text-green-600 font-medium mt-1">
                          {membershipDiscount} off court bookings
                        </span>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline">Loading...</Badge>
                  )}
                </div>
              )}
              <div className="space-y-4 text-sm text-gray-600">
                <p className="flex items-center space-x-2">
                  <span className="font-medium">Court:</span>
                  <span>{courts.find(c => c.id === bookingDetails.court_id)?.name || 'Not selected'}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="font-medium">Date:</span>
                  <span>{bookingDetails.booking_date ? format(bookingDetails.booking_date, 'PPP') : 'Not selected'}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="font-medium">Time:</span>
                  <span>
                    {bookingDetails.time_slot_id 
                      ? timeSlots.find(t => t.id === bookingDetails.time_slot_id)?.start_time.substring(0, 5)
                      : 'Not selected'}
                  </span>
                </p>
                <p className="flex items-center space-x-2">
                  <span className="font-medium">Duration:</span>
                  <span>{bookingDetails.duration_hours} hour{bookingDetails.duration_hours > 1 ? 's' : ''}</span>
                </p>
                <div className="pt-4 border-t border-gray-200">
                  <ul className="space-y-2">
                    <li>• Cancellations available up to 24h before</li>
                    <li>• Please arrive 10 minutes early</li>
                    <li>• Equipment rental available on site</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSystem;
