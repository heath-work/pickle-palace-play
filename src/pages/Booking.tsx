
import React from 'react';
import Layout from '@/components/Layout';
import BookingSystem from '@/components/BookingSystem';
import { InfoIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const BookingPage = () => {
  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Book a Court
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              Reserve your court time in just a few simple steps.
            </p>
          </div>
        </div>
      </div>

      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="mb-8">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Booking Information</AlertTitle>
            <AlertDescription>
              Members can book courts up to 3-7 days in advance depending on membership level. 
              Non-members can book 24 hours in advance, subject to availability.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="col-span-1 lg:col-span-2">
              <BookingSystem />
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Policies</h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Courts may be booked for 1-hour increments</li>
                  <li>• Maximum 2 consecutive hours per booking</li>
                  <li>• Cancellations must be made 24 hours in advance</li>
                  <li>• No-shows may result in booking restrictions</li>
                  <li>• Please arrive 10 minutes before your booking</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Court Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-900">Indoor Courts (1-3)</p>
                    <p className="text-gray-600">Premium surfaces with climate control and professional lighting</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Outdoor Courts (4-6)</p>
                    <p className="text-gray-600">Championship-grade surfaces with windscreens and shaded seating areas</p>
                  </div>
                </div>
              </div>
              
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Weather Policy</AlertTitle>
                <AlertDescription>
                  Outdoor court bookings may be rescheduled or moved indoors due to inclement weather at management's discretion.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Ready to Play More Often?</h2>
            <p className="mt-4 text-xl text-gray-500">
              Members get priority booking and better rates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Members</h3>
              <ul className="space-y-2 mb-6 text-gray-600">
                <li>• Book 24 hours in advance</li>
                <li>• Access during non-peak hours</li>
                <li>• Regular court rates</li>
              </ul>
              <p className="font-medium text-gray-900">$49/month</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-pickleball-blue">
              <div className="inline-block px-3 py-1 bg-pickleball-blue text-white rounded-full text-sm font-medium mb-4">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium Members</h3>
              <ul className="space-y-2 mb-6 text-gray-600">
                <li>• Book 3 days in advance</li>
                <li>• Access during all hours</li>
                <li>• 10% discount on court rates</li>
              </ul>
              <p className="font-medium text-gray-900">$89/month</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Elite Members</h3>
              <ul className="space-y-2 mb-6 text-gray-600">
                <li>• Book 7 days in advance</li>
                <li>• Priority court selection</li>
                <li>• 20% discount on court rates</li>
              </ul>
              <p className="font-medium text-gray-900">$149/month</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
