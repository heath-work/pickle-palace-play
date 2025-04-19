
import React, { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Stripe price IDs for each membership plan
const STRIPE_PRICES = {
  basic: 'price_1RFBFi086zbpX7xNnVIcqrty', // Replace with your actual price IDs
  premium: 'price_1RFBFi086zbpX7xNcgRvGcDx',
  elite: 'price_1RFBFi086zbpX7xNo43lGtDm',
  founder: 'price_1RFBFi086zbpX7xNTjz8n2Dv'
};

const plans = [
  {
    name: 'Basic',
    price: '$0',
    period: 'per month',
    description: 'Perfect for casual players who want occasional court time.',
    features: [
      'Access during non-peak hours',
      'Online court booking',
      'Access to open play sessions',
      'Locker room access',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline',
    color: 'border-gray-200',
    href: '/membership#basic',
    priceId: STRIPE_PRICES.basic
  },
  {
    name: 'Premium',
    price: '$18',
    period: 'per month',
    description: 'Our most popular plan for regular players.',
    features: [
      'All Basic features',
      'Access during all hours',
      'Priority court booking (3 days ahead)',
      '10% discount on court rentals',
      '15% discount on sessions',
      'Free equipment rental',
      '10% discount at pro shop',
    ],
    buttonText: 'Sign Up Now',
    buttonVariant: 'default',
    color: 'border-pickleball-blue shadow-lg',
    mostPopular: true,
    href: '/membership#premium',
    priceId: STRIPE_PRICES.premium
  },
  {
    name: 'Elite',
    price: '$35',
    period: 'per month',
    description: 'For the serious players and competitors.',
    features: [
      'All Premium features',
      'Priority court booking (7 days ahead)',
      '25% discount on court rentals',
      '25% discount on sessions',
      'Free guest passes (2 per month)',
      'Access to exclusive tournaments',
      'Monthly private coaching session',
      '15% discount at pro shop',
    ],
    buttonText: 'Get Elite',
    buttonVariant: 'outline',
    color: 'border-gray-200',
    href: '/membership#elite',
    priceId: STRIPE_PRICES.elite
  },
  {
    name: 'Founder',
    price: '$225',
    period: 'per month',
    description: 'For the OGs ballers.',
    features: [
      'All Elite features',
      '3 sessions per week',
      'Priority session bookings',
      '25% discount on court rentals',
      '25% discount on sessions',
      'Priority court booking (7 days ahead)',
      'Free drink per session',
      'PBC founders t-shirts (2 per year)',
      'Free guest passes (4 per month)',
      'Access to exclusive tournaments',
      'Monthly private coaching session',
      '25% discount at pro shop',
    ],
    buttonText: 'Become a Founder',
    buttonVariant: 'outline',
    color: 'border-gray-200',
    href: '/membership#founder',
    priceId: STRIPE_PRICES.founder
  },
];

const MembershipPlans = () => {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    try {
      setLoadingPlan(plan.name);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          type: 'membership',
          planId: plan.name.toLowerCase(),
          priceId: plan.priceId
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to initiate checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error('Please sign in to manage your subscription');
      return;
    }

    try {
      setLoadingPlan('manage');
      
      const { data, error } = await supabase.functions.invoke('create-subscription-portal', {});
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      toast.error('Failed to access subscription management');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Membership Plans
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Choose the perfect membership plan for your pickleball journey.
          </p>
          
          {user && (
            <div className="mt-6">
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={loadingPlan === 'manage'}
                className="flex items-center"
              >
                {loadingPlan === 'manage' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Loading...
                  </>
                ) : (
                  'Manage Your Subscription'
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg ${plan.color} border divide-y divide-gray-200 bg-white ${plan.mostPopular ? 'relative' : ''}`}
            >
              {plan.mostPopular && (
                <div className="absolute top-0 right-0 -mt-3 mr-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pickleball-green text-white">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-base font-medium text-gray-500">{plan.period}</span>
                </p>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                
                {user ? (
                  <Button
                    variant={plan.buttonVariant as any}
                    className={`mt-6 w-full ${plan.buttonVariant === 'default' ? 'bg-pickleball-blue hover:bg-blue-600' : 'text-pickleball-blue hover:bg-gray-50'}`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={loadingPlan === plan.name}
                  >
                    {loadingPlan === plan.name ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Loading...
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                ) : (
                  <Link to="/auth/signin">
                    <Button
                      variant={plan.buttonVariant as any}
                      className={`mt-6 w-full ${plan.buttonVariant === 'default' ? 'bg-pickleball-blue hover:bg-blue-600' : 'text-pickleball-blue hover:bg-gray-50'}`}
                    >
                      Sign In to Subscribe
                    </Button>
                  </Link>
                )}
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-gray-900">What's included</h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <CheckCircle className="flex-shrink-0 h-5 w-5 text-pickleball-green" aria-hidden="true" />
                      <span className="ml-3 text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipPlans;
