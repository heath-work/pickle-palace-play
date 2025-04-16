
import React from 'react';
import Layout from '@/components/Layout';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';

const AboutPage = () => {
  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              About Pickle Palace
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              The premier destination for pickleball enthusiasts in the region.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Pickle Palace was founded in 2020 by a group of pickleball enthusiasts who were passionate about growing the sport in our community. What started as a small club with just two courts has now expanded into the region's premier pickleball facility.
                </p>
                <p>
                  Our mission is to provide a welcoming environment for players of all skill levels, from beginners just learning the game to competitive athletes looking to improve their skills.
                </p>
                <p>
                  We've designed our facility with the player experience in mind, offering state-of-the-art courts, comfortable amenities, and a vibrant community atmosphere.
                </p>
              </div>
            </div>
            <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-xl bg-pickleball-green/20 flex items-center justify-center">
              <div className="text-center">
                <div className="h-32 w-32 bg-pickleball-orange rounded-full mx-auto"></div>
                <p className="mt-4 text-xl font-bold text-gray-800">Our facility</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Facilities</h2>
            <p className="mt-4 text-xl text-gray-500">
              Designed for the ultimate pickleball experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Indoor Courts</h3>
              <p className="text-gray-600">
                Three professional-grade indoor courts with specialized flooring, climate control, and excellent lighting for year-round play regardless of weather.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Outdoor Courts</h3>
              <p className="text-gray-600">
                Three outdoor courts with premium surfaces, windscreens, and shaded viewing areas for those beautiful days when you want to play under the sun.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pro Shop</h3>
              <p className="text-gray-600">
                Fully stocked with the latest equipment, apparel, and accessories. Our knowledgeable staff can help you find the perfect paddle and gear.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Locker Rooms</h3>
              <p className="text-gray-600">
                Clean and spacious locker rooms with showers, changing areas, and secure storage for your belongings while you play.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lounge Area</h3>
              <p className="text-gray-600">
                Comfortable seating, refreshments, and big-screen TVs showing pickleball matches and tournaments from around the world.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Training Space</h3>
              <p className="text-gray-600">
                Dedicated area for lessons, clinics, and drills with our professional coaches who can help take your game to the next level.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Visit Us</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-pickleball-blue mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Location</h3>
                    <p className="mt-1 text-gray-600">
                      123 Pickleball Avenue<br />
                      Sportsville, SP 12345
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-pickleball-blue mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Hours</h3>
                    <p className="mt-1 text-gray-600">
                      Monday - Friday: 6:00 AM - 10:00 PM<br />
                      Saturday - Sunday: 7:00 AM - 9:00 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-pickleball-blue mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                    <p className="mt-1 text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-pickleball-blue mt-1 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Email</h3>
                    <p className="mt-1 text-gray-600">info@picklepalace.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
              {/* This would be a map in a real implementation */}
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-pickleball-blue mx-auto" />
                  <p className="mt-4 text-lg font-semibold text-gray-800">Map would go here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
