
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  avatar_url: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof formSchema>;

const ProfilePage = () => {
  const { user, profile, updateProfile, signOut, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
    },
    values: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    await updateProfile(values);
    setIsSaving(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Layout>
      <div className="py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-lg bg-pickleball-blue text-white">
                  {profile?.full_name ? getInitials(profile.full_name) : user.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{profile?.full_name || user.email}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" type="button" onClick={() => signOut()}>
                      Sign Out
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
