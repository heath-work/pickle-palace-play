
import React from 'react';
import { Clock, Users, Award, Shield } from 'lucide-react';

const features = [
  {
    name: 'Extended Hours',
    description: 'Open from 6 AM to 10 PM daily, giving you plenty of time to play.',
    icon: Clock,
    color: 'text-pickleball-blue',
    bgColor: 'bg-pickleball-blue/10',
  },
  {
    name: 'Community Events',
    description: 'Regular tournaments, social mixers, and community gatherings.',
    icon: Users,
    color: 'text-pickleball-green',
    bgColor: 'bg-pickleball-green/10',
  },
  {
    name: 'Professional Coaching',
    description: 'Learn from certified coaches with years of experience.',
    icon: Award,
    color: 'text-pickleball-orange',
    bgColor: 'bg-pickleball-orange/10',
  },
  {
    name: 'Premium Facilities',
    description: 'Indoor and outdoor courts, locker rooms, pro shop, and more.',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

const Features = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Why Choose Pickle Palace?
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            We offer the best pickleball experience in the region with state-of-the-art facilities and a vibrant community.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                  <div className="-mt-6">
                    <div>
                      <span className={`inline-flex items-center justify-center p-3 ${feature.bgColor} rounded-md shadow-lg`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                    <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
