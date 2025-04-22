import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingSystem from '@/components/BookingSystem';
import Layout from '@/components/Layout';

const Booking = () => {
  useEffect(() => {
    document.title = "Court Bookings | Pickle Palace";
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {/* Removed Group Sessions tab for clarity */}
        <BookingSystem />
      </div>
    </Layout>
  );
};

export default Booking;
