import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { format } from 'date-fns';
import { Calendar, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Booking } from '@/types/supabase';

const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            court_id,
            booking_date,
            start_time,
            end_time,
            created_at,
            courts(name, type)
          `)
          .eq('user_id', user.id)
          .order('booking_date', { ascending: false })
          .order('start_time', { ascending: true }) as { data: any[] | null, error: any };

        if (error) throw error;

        // Transform the data to include court name and type
        const formattedBookings = data?.map(booking => ({
          id: booking.id,
          court_id: booking.court_id,
          court_name: booking.courts.name,
          court_type: booking.courts.type,
          booking_date: booking.booking_date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          created_at: booking.created_at,
          user_id: user.id // Add this to match our type
        })) || [];

        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load booking history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', user.id) as { error: any };

      if (error) throw error;

      // Remove the booking from the state
      setBookings(bookings.filter(booking => booking.id !== bookingId));
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const isUpcoming = (bookingDate: string) => {
    return new Date(bookingDate) >= new Date(new Date().setHours(0, 0, 0, 0));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Booking History</h1>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pickleball-blue mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading your bookings...</p>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings found</h3>
              <p className="mt-2 text-gray-500">You haven't made any court reservations yet.</p>
              <Button 
                className="mt-4 bg-pickleball-blue hover:bg-blue-600"
                onClick={() => window.location.href = '/booking'}
              >
                Book a Court
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Bookings</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Court</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings
                        .filter(booking => isUpcoming(booking.booking_date))
                        .map(booking => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">
                              {booking.court_name} ({booking.court_type})
                            </TableCell>
                            <TableCell>{formatDate(booking.booking_date)}</TableCell>
                            <TableCell>
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </TableCell>
                            <TableCell>
                              {Math.round((new Date(`2000-01-01T${booking.end_time}`).getTime() - 
                                new Date(`2000-01-01T${booking.start_time}`).getTime()) / 
                                (1000 * 60 * 60))} hour(s)
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                <X className="mr-1 h-4 w-4" />
                                Cancel
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      {bookings.filter(booking => isUpcoming(booking.booking_date)).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                            No upcoming bookings
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Past Bookings</h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Court</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings
                        .filter(booking => !isUpcoming(booking.booking_date))
                        .map(booking => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">
                              {booking.court_name} ({booking.court_type})
                            </TableCell>
                            <TableCell>{formatDate(booking.booking_date)}</TableCell>
                            <TableCell>
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </TableCell>
                            <TableCell>
                              {Math.round((new Date(`2000-01-01T${booking.end_time}`).getTime() - 
                                new Date(`2000-01-01T${booking.start_time}`).getTime()) / 
                                (1000 * 60 * 60))} hour(s)
                            </TableCell>
                          </TableRow>
                        ))}
                      {bookings.filter(booking => !isUpcoming(booking.booking_date)).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                            No past bookings
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookingHistory;
