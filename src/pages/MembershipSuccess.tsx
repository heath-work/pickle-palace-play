
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const MembershipSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  
  // Sign in form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [showSignInForm, setShowSignInForm] = useState(false);

  useEffect(() => {
    // In a production app, you would verify the session with Stripe here
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }
    
    setSigningIn(true);
    const { error } = await signIn(email, password);
    setSigningIn(false);
    
    if (error) {
      if (error.message.includes('not confirmed')) {
        toast.error('Your email is not confirmed yet. Please check your inbox for a confirmation email.');
        setVerifyingEmail(true);
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Signed in successfully');
      navigate('/auth/profile');
    }
  };

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
              
              {!user ? (
                <div className="mt-8 w-full max-w-md">
                  {verifyingEmail ? (
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900">Verify Your Email</h3>
                      <p className="mt-2 text-gray-600">
                        Please check your email inbox for a confirmation link. You need to verify your email before signing in.
                      </p>
                    </div>
                  ) : showSignInForm ? (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Sign In to Your Account</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="your@email.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={handleSignIn} 
                          className="w-full bg-pickleball-blue hover:bg-blue-600"
                          disabled={signingIn}
                        >
                          {signingIn ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                            </>
                          ) : (
                            'Sign In'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        To view your membership details and start booking courts, please sign in to your account.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                          onClick={() => setShowSignInForm(true)}
                          className="bg-pickleball-blue hover:bg-blue-600"
                        >
                          Sign In
                        </Button>
                        <Button 
                          onClick={() => navigate('/auth/signin')}
                          variant="outline"
                        >
                          Go to Sign In Page
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate('/auth/profile')}
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
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MembershipSuccess;
