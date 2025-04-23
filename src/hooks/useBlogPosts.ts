
import { useQuery } from '@tanstack/react-query';
import { blogPosts, getPostBySlug } from '@/data/blogPosts';
import { BlogPost } from '@/types/blog';

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: async (): Promise<BlogPost[]> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return blogPosts;
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async (): Promise<BlogPost | undefined> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return getPostBySlug(slug);
    },
    enabled: !!slug,
  });
}
