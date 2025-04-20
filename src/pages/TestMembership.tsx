
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TestMembership = () => {
  const { user, profile, updateProfile } = useAuth();
  const [selectedMembership, setSelectedMembership] = useState<string>(profile?.membership_type || 'None');
  const [isLoading, setIsLoading] = useState(false);
  const [responseLog, setResponseLog] = useState<string>('');

  const handleMembershipChange = (value: string) => {
    setSelectedMembership(value);
  };

  const updateMembershipDirectly = async () => {
    if (!user) {
      toast.error('You must be logged in to update membership');
      return;
    }
    
    setIsLoading(true);
    setResponseLog('Starting direct membership update...');
    
    try {
      // First try updating through AuthContext
      setResponseLog(prev => prev + '\nAttempting to update through AuthContext...');
      const { error } = await updateProfile({ membership_type: selectedMembership });
      
      if (error) {
        setResponseLog(prev => prev + `\nAuthContext update failed: ${error.message}`);
        throw error;
      }
      
      setResponseLog(prev => prev + '\nMembership updated successfully via AuthContext!');
      toast.success(`Membership updated to ${selectedMembership}`);
    } catch (error: any) {
      toast.error('Failed to update membership');
      console.error('Error updating membership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMembershipViaFunction = async () => {
    if (!user) {
      toast.error('You must be logged in to update membership');
      return;
    }
    
    setIsLoading(true);
    setResponseLog('Starting membership update via edge function...');
    
    try {
      setResponseLog(prev => prev + '\nCalling update-profile-membership function...');
      const { data, error } = await supabase.functions.invoke('update-profile-membership', {
        body: {
          userId: user.id,
          membershipType: selectedMembership
        }
      });
      
      if (error) {
        setResponseLog(prev => prev + `\nFunction error: ${error.message}`);
        throw error;
      }
      
      setResponseLog(prev => prev + `\nFunction response: ${JSON.stringify(data, null, 2)}`);
      toast.success(`Membership updated to ${selectedMembership}`);
      
      // Refresh profile data
      window.location.reload();
    } catch (error: any) {
      toast.error('Failed to update membership');
      console.error('Error updating membership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Membership Test Tool</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Profile Information</h2>
          {user ? (
            <div className="space-y-2">
              <p><span className="font-medium">User ID:</span> {user.id}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Membership Type:</span> {profile?.membership_type || 'None'}</p>
              <p><span className="font-medium">Full Name:</span> {profile?.full_name || 'Not set'}</p>
            </div>
          ) : (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Please sign in to use this tool.
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {user && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Update Membership Type</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Membership Type
                </label>
                <Select value={selectedMembership} onValueChange={handleMembershipChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Elite">Elite</SelectItem>
                    <SelectItem value="Founder">Founder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={updateMembershipDirectly} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update via AuthContext'
                  )}
                </Button>
                
                <Button 
                  onClick={updateMembershipViaFunction} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update via Edge Function'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {responseLog && (
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
            {responseLog}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestMembership;
