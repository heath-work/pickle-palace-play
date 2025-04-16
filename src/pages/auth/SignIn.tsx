
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SignInForm } from '@/components/auth/SignInForm';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';

const SignInPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignInForm />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center">
                Don't have an account?{' '}
                <Link to="/auth/signup" className="text-pickleball-blue hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SignInPage;
