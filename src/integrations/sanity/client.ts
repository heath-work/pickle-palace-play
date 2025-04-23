
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'your-project-id', // Replace with your Sanity project ID
  dataset: 'production',
  apiVersion: '2022-03-25', // Use a date of when you created the project
  useCdn: true, // Set to false if you want to ensure fresh data
});

// Helper function to build image URLs
export const urlFor = (source: any) => {
  return `https://cdn.sanity.io/images/your-project-id/production/${source}`;
};
