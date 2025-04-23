
import { useQuery } from '@tanstack/react-query';
import { blogPosts, getPostBySlug } from '@/data/blogPosts';
import { BlogPost } from '@/types/blog';

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: async (): Promise<BlogPost[]> => {
      // Return the preloaded blog posts instantly
      return blogPosts;
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async (): Promise<BlogPost | undefined> => {
      // Return the preloaded blog post by slug
      return getPostBySlug(slug);
    },
    enabled: !!slug,
  });
}
