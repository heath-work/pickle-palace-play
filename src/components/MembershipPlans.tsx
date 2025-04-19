
import React, { useState } from 'react';
import { CheckCircle, Loader2, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Stripe product IDs for each membership plan
const STRIPE_PRODUCTS = {
  basic: 'prod_S9VikH2CV6NBRy',
  premium: 'prod_S9ViDXMS27q5uG', // Using Elite product ID for Premium since they're the same tier
  elite: 'prod_S9ViDXMS27q5uG',
  founder: 'prod_S9VhRsmJf38RUc'
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
    productId: STRIPE_PRODUCTS.basic
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
    productId: STRIPE_PRODUCTS.premium
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
    productId: STRIPE_PRODUCTS.elite
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
    productId: STRIPE_PRODUCTS.founder
  },
];

const MembershipPlans = () => {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) {
      setSelectedPlan(plan);
      setSignupDialogOpen(true);
      return;
    }

    try {
      setLoadingPlan(plan.name);
      setError(null);
      
      console.log('Starting checkout for plan:', plan.name);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          type: 'membership',
          planId: plan.name.toLowerCase(),
          productId: plan.productId
        }
      });
      
      if (error) {
        console.error('Checkout error:', error);
        setError(`Checkout error: ${error.message}`);
        toast.error('Failed to initiate checkout');
        throw error;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned', data);
        setError('No checkout URL returned');
        toast.error('Failed to initiate checkout');
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to initiate checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleSignupAndSubscribe = async () => {
    if (!selectedPlan) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (!email || !password) {
        setError('Email and password are required');
        toast.error('Email and password are required');
        return;
      }
      
      console.log('Starting signup and checkout for plan:', selectedPlan.name);
      
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout', {
        body: {
          type: 'membership',
          planId: selectedPlan.name.toLowerCase(),
          productId: selectedPlan.productId,
          email: email,
          password: password,
          fullName: fullName
        }
      });
      
      if (functionError) {
        console.error('Error during signup and checkout:', functionError);
        setError(`Error: ${functionError.message}`);
        toast.error('Failed to create account and checkout');
        return;
      }
      
      if (!data) {
        console.error('No data returned from edge function');
        setError('No data returned from edge function');
        toast.error('Failed to create account and checkout');
        return;
      }
      
      if (data.error) {
        console.error('Error from edge function:', data.error);
        setError(`Error: ${data.error}`);
        toast.error('Failed to create account and checkout');
        return;
      }
      
      if (data.url) {
        setSignupDialogOpen(false);
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned', data);
        setError('No checkout URL returned');
        toast.error('Failed to create account and checkout');
      }
    } catch (error: any) {
      console.error('Error during signup and checkout:', error);
      setError(`Error: ${error.message || 'Unknown error'}`);
      toast.error('Failed to create account and checkout');
    } finally {
      setIsLoading(false);
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

      {/* Signup Dialog */}
      <Dialog open={signupDialogOpen} onOpenChange={setSignupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create an account to continue</DialogTitle>
            <DialogDescription>
              Sign up to subscribe to the {selectedPlan?.name} plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  className="pl-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={() => setSignupDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSignupAndSubscribe} 
                disabled={!email || !password || isLoading}
                className="bg-pickleball-blue hover:bg-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Processing...
                  </>
                ) : (
                  'Sign Up & Continue'
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-4">
              Already have an account? <Link to="/auth/signin" className="text-pickleball-blue hover:underline">Sign in</Link> instead.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembershipPlans;
