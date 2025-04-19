
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const MembershipSuccess = () => {
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
              <h2 className="text-2xl font-bold text-gray-900">Processing your membership...</h2>
              <p className="mt-2 text-lg text-gray-600">Please wait while we confirm your subscription.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-green-100 p-3 rounded-full mb-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Membership Activated!</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl">
                Thank you for becoming a member of our pickleball community. Your subscription has been successfully processed.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/membership')}
                  className="bg-pickleball-blue hover:bg-blue-600"
                >
                  View Membership Details
                </Button>
                <Button
                  onClick={() => navigate('/booking')}
                  variant="outline"
                >
                  Book a Court
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MembershipSuccess;
