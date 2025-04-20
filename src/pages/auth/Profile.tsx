
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, X, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Booking } from '@/types/supabase';

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  avatar_url: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof formSchema>;

const ProfilePage = () => {
  const { user, profile, updateProfile, signOut, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [membershipLoading, setMembershipLoading] = useState(true);
  const [membershipDetails, setMembershipDetails] = useState({ 
    type: 'No active membership',
    isActive: false
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
    },
    values: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
    },
  });

  useEffect(() => {
    const fetchMembershipStatus = async () => {
      if (!user) return;
      
      try {
        setMembershipLoading(true);
        
        // First try to get membership from profile
        if (profile?.membership_type) {
          setMembershipDetails({
            type: profile.membership_type,
            isActive: true
          });
          setMembershipLoading(false);
          return;
        }
        
        // If no membership in profile, check Stripe directly
        const { data: customerData, error: customerError } = await supabase.functions.invoke('check-subscription', {});
        
        if (customerError) {
          console.error('Error checking subscription:', customerError);
          toast.error('Failed to check membership status');
          setMembershipLoading(false);
          return;
        }
        
        if (customerData?.subscription_tier) {
          setMembershipDetails({
            type: customerData.subscription_tier,
            isActive: true
          });
        } else {
          setMembershipDetails({
            type: 'No active membership',
            isActive: false
          });
        }
      } catch (error) {
        console.error('Error fetching membership status:', error);
        toast.error('Failed to load membership status');
      } finally {
        setMembershipLoading(false);
      }
    };

    fetchMembershipStatus();
  }, [user, profile]);

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id,
            court_id,
            booking_date,
            start_time,
            end_time,
            duration_hours,
            courts(name, type)
          `)
          .eq('user_id', user.id)
          .gte('booking_date', format(new Date(), 'yyyy-MM-dd'))
          .order('booking_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(5);

        if (error) throw error;
        
        const bookingsWithUserId = data?.map(booking => ({
          ...booking,
          user_id: user.id
        })) || [];
        
        setUpcomingBookings(bookingsWithUserId as Booking[]);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load upcoming bookings');
      }
    };

    fetchUpcomingBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!user || !confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)
        .eq('user_id', user.id);

      if (error) throw error;

      setUpcomingBookings(prev => prev.filter(booking => booking.id !== bookingId));
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error('Please sign in to manage your subscription');
      return;
    }

    try {
      setIsLoadingPortal(true);
      const { data, error } = await supabase.functions.invoke('create-subscription-portal', {});
      
      if (error) {
        console.error('Portal error:', error);
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('No portal URL returned:', data);
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      toast.error('Failed to access subscription management');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    await updateProfile(values);
    setIsSaving(false);
  };

  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-lg bg-pickleball-blue text-white">
                  {profile?.full_name ? getInitials(profile.full_name) : user.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{profile?.full_name || user.email}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Membership Status</CardTitle>
                <CardDescription>Manage your membership and subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Current Plan</p>
                      {membershipLoading ? (
                        <div className="flex items-center mt-1">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin text-pickleball-blue" />
                          <p className="text-gray-500">Loading membership details...</p>
                        </div>
                      ) : (
                        <p className={`text-2xl font-bold ${membershipDetails.isActive ? 'text-pickleball-blue' : 'text-gray-500'}`}>
                          {membershipDetails.type}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleManageSubscription}
                      disabled={isLoadingPortal || !membershipDetails.isActive}
                      className="flex items-center"
                    >
                      {isLoadingPortal ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Manage Membership
                        </>
                      )}
                    </Button>
                  </div>
                  {!membershipDetails.isActive && !membershipLoading && (
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.href = '/membership'}
                        className="w-full"
                      >
                        View Membership Options
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="avatar_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/avatar.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between">
                      <Button variant="outline" type="button" onClick={() => signOut()}>
                        Sign Out
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Your next scheduled court sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <p className="text-gray-500">No upcoming bookings</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{booking.courts?.name} ({booking.courts?.type})</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(booking.booking_date), 'PPP')} at{' '}
                            {format(new Date(`2000-01-01T${booking.start_time}`), 'h:mm a')}
                          </p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
