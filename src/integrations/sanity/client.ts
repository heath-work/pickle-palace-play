
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'l3oio017', // Your provided Sanity project ID
  dataset: 'production',
  apiVersion: '2022-03-25',
  useCdn: true,
});

// Helper function to build image URLs
export const urlFor = (source: string) => {
  if (!source) return '';
  // Extract the image reference from the full path if needed
  const imageRef = source.includes('/') ? source.split('/').pop() : source;
  return `https://cdn.sanity.io/images/l3oio017/production/${imageRef}`;
};
