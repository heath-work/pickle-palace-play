
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingSystem from '@/components/BookingSystem';
import SessionList from '@/components/SessionList';

const Booking = () => {
  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="bookings">Court Bookings</TabsTrigger>
          <TabsTrigger value="sessions">Group Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          <BookingSystem />
        </TabsContent>
        <TabsContent value="sessions">
          <SessionList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Booking;
