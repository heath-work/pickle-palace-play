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
          <div className="text-center py-12 bg-court-green">
            <h1 className="hero">
              Book a court
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              Choose the membership that fits your pickleball journey.
            </p>         
          </div>      
      <div className="container mx-auto py-8">
        {/* Removed Group Sessions tab for clarity */}
        <BookingSystem />
      </div>
    </Layout>
  );
};

export default Booking;
