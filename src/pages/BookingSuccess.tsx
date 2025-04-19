
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a production app, you would verify the session with Stripe here
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-16 w-16 text-pickleball-blue animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-gray-900">Processing your booking...</h2>
              <p className="mt-2 text-lg text-gray-600">Please wait while we confirm your court reservation.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-green-100 p-3 rounded-full mb-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Court Reserved Successfully!</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                Thank you for your booking. Your payment has been processed successfully and your court is now reserved.
              </p>
              <div className="mt-8 p-6 bg-gray-50 rounded-lg w-full max-w-md">
                <div className="flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-pickleball-blue mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                </div>
                <p className="text-gray-600">You'll find your booking details in your booking history.</p>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/booking-history')}
                  className="bg-pickleball-blue hover:bg-blue-600"
                >
                  View Booking History
                </Button>
                <Button
                  onClick={() => navigate('/booking')}
                  variant="outline"
                >
                  Book Another Court
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookingSuccess;
