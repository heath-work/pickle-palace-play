
import React from 'react';
import Layout from '@/components/Layout';
import MembershipPlans from '@/components/MembershipPlans';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const MembershipPage = () => {
  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Membership Options
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              Choose the membership that fits your pickleball journey.
            </p>
          </div>
        </div>
      </div>

      <MembershipPlans />

      <div className="py-16 bg-white" id="basic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="col-span-1 lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Basic Membership</h2>
              <p className="text-lg text-gray-600 mb-8">
                Perfect for casual players who enjoy occasional games and are looking for an affordable way to access quality courts.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits Include:</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Access during non-peak hours (Monday-Friday 11am-4pm, weekends after 5pm)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Online court booking system (24 hours in advance)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Access to open play sessions twice weekly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Full locker room facilities with showers and day-use lockers</span>
                </li>
              </ul>
              
              <Button className="bg-pickleball-blue hover:bg-blue-600">Join Basic Membership</Button>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Membership Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">Monthly Fee</p>
                  <p className="text-gray-600">$49 per month</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Annual Payment Option</p>
                  <p className="text-gray-600">$529 per year (save $59)</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Initiation Fee</p>
                  <p className="text-gray-600">$25 one-time fee</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contract Term</p>
                  <p className="text-gray-600">Month-to-month, cancel anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50" id="premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="col-span-1 lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Premium Membership</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our most popular plan for regular players who want more flexibility and additional benefits.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits Include:</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">All Basic benefits</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Access during all hours (full operating hours)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Priority court booking (3 days in advance)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Free equipment rental</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">10% discount on all pro shop purchases</span>
                </li>
              </ul>
              
              <Button className="bg-pickleball-blue hover:bg-blue-600">Join Premium Membership</Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg border-2 border-pickleball-blue shadow-md">
              <div className="inline-block px-3 py-1 bg-pickleball-blue text-white rounded-full text-sm font-medium mb-4">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium Membership Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">Monthly Fee</p>
                  <p className="text-gray-600">$89 per month</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Annual Payment Option</p>
                  <p className="text-gray-600">$969 per year (save $99)</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Initiation Fee</p>
                  <p className="text-gray-600">$0 (waived)</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contract Term</p>
                  <p className="text-gray-600">3-month minimum, then month-to-month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white" id="elite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="col-span-1 lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Elite Membership</h2>
              <p className="text-lg text-gray-600 mb-8">
                For the serious players and competitors who want the ultimate pickleball experience.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits Include:</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">All Premium benefits</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Priority court booking (7 days in advance)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Free guest passes (2 per month)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Access to exclusive tournaments and events</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">Monthly private coaching session (30 minutes)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-pickleball-green mr-3 mt-0.5" />
                  <span className="text-gray-600">20% discount on all pro shop purchases</span>
                </li>
              </ul>
              
              <Button className="bg-pickleball-blue hover:bg-blue-600">Join Elite Membership</Button>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Elite Membership Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">Monthly Fee</p>
                  <p className="text-gray-600">$149 per month</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Annual Payment Option</p>
                  <p className="text-gray-600">$1,619 per year (save $169)</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Initiation Fee</p>
                  <p className="text-gray-600">$0 (waived)</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contract Term</p>
                  <p className="text-gray-600">6-month minimum, then month-to-month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-xl text-gray-500">
              Everything you need to know about our memberships
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Can I switch between membership tiers?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, you can upgrade your membership at any time. Downgrades can be processed after your minimum commitment period is complete.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Is there a family membership option?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, we offer family add-ons for all membership tiers. You can add family members at a 20% discount off the regular membership rate.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  What happens if I need to cancel my membership?
                </AccordionTrigger>
                <AccordionContent>
                  After your minimum commitment period, you can cancel with 30 days notice. There are no cancellation fees, but we don't offer refunds for partial months.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Are there any age restrictions for memberships?
                </AccordionTrigger>
                <AccordionContent>
                  Members must be at least 18 years old to hold a membership. However, we offer junior memberships for players under 18, which must be linked to an adult membership.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  How many courts can I book at once?
                </AccordionTrigger>
                <AccordionContent>
                  Basic members can book one court per day. Premium members can book up to two courts per day, and Elite members can book up to three courts per day, subject to availability.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  Do you offer any trial periods?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, we offer a 7-day trial pass for $25, which gives you full Premium-level access to our facilities. If you decide to join, we'll apply the trial fee toward your initiation fee.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MembershipPage;
