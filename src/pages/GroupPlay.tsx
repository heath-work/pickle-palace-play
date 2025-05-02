
import React from 'react';
import Layout from '@/components/Layout';
import SessionList from '@/components/SessionList';

const GroupPlay = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="hero mb-6 text-center">Group Play Sessions</h1>
        <SessionList />
      </div>
    </Layout>
  );
};

export default GroupPlay;
