
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Hypno from '@/components/Hypno';
import Features from '@/components/Features';
import MembershipPlans from '@/components/MembershipPlans';
import UpcomingSessions from '@/components/UpcomingSessions';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import { Session } from '@/types/sessions';
import { format, isToday, parseISO } from 'date-fns';


const Index = () => {
  const { sessions, isLoading } = useSessions();
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (sessions.length > 0) {
      // Filter sessions for today's date
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = sessions.filter(session => 
        session.date === today
      );
      
      // If not enough sessions for today, include upcoming ones
      if (todaySessions.length < 3) {
        const futureSessions = sessions
          .filter(session => session.date > today)
          .sort((a, b) => a.date.localeCompare(b.date));
          
        const combined = [...todaySessions, ...futureSessions];
        setUpcomingSessions(combined.slice(0, 3));
      } else {
        // Sort today's sessions by start time
        const sortedTodaySessions = todaySessions
          .sort((a, b) => a.start_time.localeCompare(b.start_time));
          
        setUpcomingSessions(sortedTodaySessions.slice(0, 3));
      }
    }
  }, [sessions]);

  return (
    <Layout>
      <Hero />
      {/* <Features /> */}
      <Hypno />
      <UpcomingSessions 
        sessions={upcomingSessions}
        isLoading={isLoading}
      />
      
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
                  <Button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-xl text-pickleball-blue bg-white hover:bg-gray-50">
                    Book a Court
                  </Button>
                </Link>
              </div>
              <div className="ml-3 inline-flex">
                <Link to="/membership">
                  <Button variant="outline" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-xl text-white border-white hover:bg-pickleball-blue">
                    Memberships
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
