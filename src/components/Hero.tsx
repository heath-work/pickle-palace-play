
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative bg-black hero-frame hero-bg-blur overflow-hidden flex-center">
      {/* Background pattern */}
      <div className="absolute inset-0  from-pickleball-blue/10 to-pickleball-green/10 z-0"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
          <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8">
            <div className="text-center lg:text-left">
              <img src="public/images/pbc-logo-yellow.svg" width="200" class="Pickle Ballers Club - whiffle ball shaped logo"/>
              <h1 className="hero text-pickleball-blue">
                <span className="block">FUN. FITNESS. COMMUNITY.</span>
                {/* <span className="block text-pickleball-blue">Pickle Palace</span> */}
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0 md:mt-5 md:text-xl">
                The premier destination for pickleball enthusiasts. State-of-the-art courts, expert coaching, and a vibrant community await you.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link to="/booking">
                    <Button className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md bg-pickleball-blue md:py-4 md:text-lg md:px-10 primary">
                      Book a Court
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link to="/membership">
                    <Button variant="outline" className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-pickleball-blue bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 secondary">
                      View Memberships
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 p-8 flex items-center justify-center">
            <div className="relative h-64 w-full sm:h-72 md:h-96 lg:h-full lg:w-full overflow-hidden rounded-xl shadow-xl">
              <div className="absolute inset-0 bg-pickleball-green/20 flex items-center justify-center">
                <div className="text-center animate-bounce-slow">
                  <div className="h-24 w-24 sm:h-32 sm:w-32 bg-pickleball-orange rounded-full mx-auto"></div>
                  <p className="mt-4 text-xl font-bold text-gray-800">Pickleball in action!</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Hero;
