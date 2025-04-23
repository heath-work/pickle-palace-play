
import { BlogPost } from '@/types/blog';
import { importAllPosts } from '@/utils/blogLoader';

// Get all blog posts from Markdown files
export const blogPosts: BlogPost[] = importAllPosts();

// Get a single post by slug
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}
