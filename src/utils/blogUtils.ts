
import { BlogPost } from '@/types/blog';

// Get all unique tags from blog posts
export function getAllTags(posts: BlogPost[]): string[] {
  const tags = new Set<string>();
  
  posts.forEach(post => {
    post.categories?.forEach(category => {
      tags.add(category.title);
    });
  });
  
  return Array.from(tags).sort();
}

// Calculate approximate reading time
export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
}

// Filter posts by tag
export function filterPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  if (!tag) return posts;
  
  return posts.filter(post => 
    post.categories?.some(category => category.title.toLowerCase() === tag.toLowerCase())
  );
}
