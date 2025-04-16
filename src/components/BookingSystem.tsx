
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type Court = {
  id: number;
  name: string;
  type: string;
};

type TimeSlot = {
  id: number;
  time: string;
  available: boolean;
};

const courts: Court[] = [
  { id: 1, name: 'Court 1', type: 'Indoor' },
  { id: 2, name: 'Court 2', type: 'Indoor' },
  { id: 3, name: 'Court 3', type: 'Indoor' },
  { id: 4, name: 'Court 4', type: 'Outdoor' },
  { id: 5, name: 'Court 5', type: 'Outdoor' },
  { id: 6, name: 'Court 6', type: 'Outdoor' },
];

const timeSlots: TimeSlot[] = [
  { id: 1, time: '7:00 AM - 8:00 AM', available: true },
  { id: 2, time: '8:00 AM - 9:00 AM', available: true },
  { id: 3, time: '9:00 AM - 10:00 AM', available: false },
  { id: 4, time: '10:00 AM - 11:00 AM', available: true },
  { id: 5, time: '11:00 AM - 12:00 PM', available: true },
  { id: 6, time: '12:00 PM - 1:00 PM', available: false },
  { id: 7, time: '1:00 PM - 2:00 PM', available: true },
  { id: 8, time: '2:00 PM - 3:00 PM', available: true },
  { id: 9, time: '3:00 PM - 4:00 PM', available: true },
  { id: 10, time: '4:00 PM - 5:00 PM', available: false },
  { id: 11, time: '5:00 PM - 6:00 PM', available: true },
  { id: 12, time: '6:00 PM - 7:00 PM', available: true },
  { id: 13, time: '7:00 PM - 8:00 PM', available: true },
  { id: 14, time: '8:00 PM - 9:00 PM', available: true },
];

const BookingSystem = () => {
  const [date, setDate] = useState<Date>();
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  const handleBooking = () => {
    if (!date || !selectedCourt || !selectedTimeSlot) {
      toast.error('Please select a date, court, and time slot');
      return;
    }

    toast.success('Court booked successfully!', {
      description: `You have booked ${selectedCourt} on ${date ? format(date, 'PPP') : ''} at ${selectedTimeSlot}`,
    });

    // Reset selections after booking
    setDate(undefined);
    setSelectedCourt('');
    setSelectedTimeSlot('');
  };

  const availableTimeSlots = timeSlots.filter(slot => slot.available);

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

        <div className="max-w-md mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Court
              </label>
              <Select
                value={selectedCourt}
                onValueChange={setSelectedCourt}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a court" />
                </SelectTrigger>
                <SelectContent>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.name}>
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
                value={selectedTimeSlot}
                onValueChange={setSelectedTimeSlot}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.time}>
                      {slot.time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-pickleball-blue hover:bg-blue-600" 
              onClick={handleBooking}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSystem;
