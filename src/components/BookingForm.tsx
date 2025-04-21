
import React, { useEffect, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Court, TimeSlot } from '@/types/supabase';
import { BookingDetails } from '@/hooks/useBooking';
import BookingCalendar from './BookingCalendar';

interface BookingFormProps {
  date: Date | undefined;
  courts: Court[];
  timeSlots: TimeSlot[];
  availableTimeSlots: TimeSlot[];
  bookingDetails: BookingDetails;
  isLoading: boolean;
  isCheckingAvailability: boolean;
  onDateSelect: (date: Date | undefined) => void;
  onCourtSelect: (courtId: string) => void;
  onTimeSlotSelect: (timeSlotId: string) => void;
  onDurationSelect: (duration: string) => void;
  onBookingSubmit: () => Promise<void>;
}

const BookingForm = ({
  date,
  courts,
  timeSlots,
  availableTimeSlots,
  bookingDetails,
  isLoading,
  isCheckingAvailability,
  onDateSelect,
  onCourtSelect,
  onTimeSlotSelect,
  onDurationSelect,
  onBookingSubmit
}: BookingFormProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [membershipType, setMembershipType] = useState<string | null>(null);

  // Ensure we have the latest profile data when component mounts
  useEffect(() => {
    if (user) {
      console.log('BookingForm: Refreshing profile data on mount');
      refreshProfile(user.id);
    }
  }, [user, refreshProfile]);

  // Once profile is loaded, store membership type in local state
  useEffect(() => {
    if (profile) {
      console.log('Setting membership type from profile:', profile.membership_type);
      setMembershipType(profile.membership_type);
    }
  }, [profile]);

  // Debug log for profile information
  useEffect(() => {
    if (profile) {
      console.log('Current profile in BookingForm:', {
        id: profile.id,
        username: profile.username,
        membership_type: profile.membership_type || 'No membership type found',
        localMembershipType: membershipType
      });
    }
  }, [profile, membershipType]);

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      if (!user) {
        toast.error('Please sign in to book a court');
        return;
      }

      if (!bookingDetails.court_id || !bookingDetails.booking_date || !bookingDetails.time_slot_id) {
        toast.error('Please select a date, court, and time slot');
        return;
      }
      
      // Always use our local state for membership type which is guaranteed to be loaded
      console.log('Creating checkout with details:', { 
        court_id: bookingDetails.court_id,
        duration_hours: bookingDetails.duration_hours,
        membershipType: membershipType || 'None',
        booking_date: format(bookingDetails.booking_date, 'yyyy-MM-dd'),
        time_slot_id: bookingDetails.time_slot_id
      });
      
      // Create a checkout session with all booking details for creating the booking after payment
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          type: 'booking',
          bookingDetails: {
            court_id: bookingDetails.court_id,
            booking_date: format(bookingDetails.booking_date, 'yyyy-MM-dd'),
            time_slot_id: bookingDetails.time_slot_id,
            duration_hours: bookingDetails.duration_hours,
            membership_type: membershipType // Use our local state variable
          }
        }
      });
      
      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Log membership discount for debugging
  const getMembershipDiscount = () => {
    if (!membershipType) return 0;
    if (membershipType === "Premium") return 0.10;
    if (membershipType === "Elite") return 0.15;
    if (membershipType === "Founder") return 0.25;
    return 0;
  };

  useEffect(() => {
    // Debug log current discount whenever membership type changes
    console.log('Current membership discount:', {
      membershipType,
      discountPercentage: getMembershipDiscount() * 100 + '%'
    });
  }, [membershipType]);

  return (
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
            onValueChange={onCourtSelect}
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
            onValueChange={onTimeSlotSelect}
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
            onValueChange={onDurationSelect}
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

        {membershipType && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-md">
            <p className="text-sm text-green-700">
              <span className="font-medium">Active membership: </span>
              {membershipType}
              {getMembershipDiscount() > 0 && (
                <span className="ml-1">
                  ({getMembershipDiscount() * 100}% discount applied)
                </span>
              )}
            </p>
          </div>
        )}

        <Button 
          className="w-full bg-pickleball-blue hover:bg-blue-600" 
          onClick={handlePayment}
          disabled={isLoading || isProcessingPayment || !user || !date || !bookingDetails.court_id || !bookingDetails.time_slot_id}
        >
          {isLoading || isProcessingPayment ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              {isProcessingPayment ? 'Processing Payment...' : 'Loading...'}
            </>
          ) : (
            'Book and Pay Now'
          )}
        </Button>
      </div>
    </div>
  );
};

export default BookingForm;
