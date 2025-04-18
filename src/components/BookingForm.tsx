
import React from 'react';
import { Clock } from 'lucide-react';
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
  const { user } = useAuth();

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

        <Button 
          className="w-full bg-pickleball-blue hover:bg-blue-600" 
          onClick={onBookingSubmit}
          disabled={isLoading || !user || !date || !bookingDetails.court_id || !bookingDetails.time_slot_id}
        >
          {isLoading ? 'Processing...' : 'Book Now'}
        </Button>
      </div>
    </div>
  );
};

export default BookingForm;
