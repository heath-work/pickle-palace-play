
import React from 'react';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import MembershipPlans from '@/components/MembershipPlans';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <MembershipPlans />
      
      <div className="bg-pickleball-blue py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Play?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Book a court now or join our community as a member.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <Link to="/booking">
                  <Button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-pickleball-blue bg-white hover:bg-gray-50">
                    Book a Court
                  </Button>
                </Link>
              </div>
              <div className="ml-3 inline-flex">
                <Link to="/membership">
                  <Button variant="outline" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white border-white hover:bg-pickleball-blue">
                    View Memberships
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
