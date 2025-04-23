
import { promises as fs } from 'fs';
import matter from 'front-matter';
import { marked } from 'marked';
import { BlogPost } from '@/types/blog';

// Define the frontmatter type to match our blog post structure
interface PostFrontmatter {
  title: string;
  slug: string;
  date: string;
  description?: string;
  image?: string;
  author?: string;
  tags?: string[];
}

// Get all blog posts from the content directory
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // In browser environment, we'll use a different approach
    // This will be replaced with our imported blogPosts in the hook
    return [];
  } catch (error) {
    console.error("Error loading blog posts:", error);
    return [];
  }
}

// Function to parse the markdown content when in server context
export function parseMarkdownPost(slug: string, content: string): BlogPost {
  const { attributes, body } = matter<PostFrontmatter>(content);
  
  const htmlContent = marked(body);
  
  return {
    id: slug,
    title: attributes.title,
    slug: attributes.slug,
    publishedAt: attributes.date,
    excerpt: attributes.description,
    mainImage: attributes.image,
    body: htmlContent,
    author: attributes.author ? {
      id: 'author-1',
      name: attributes.author,
    } : undefined,
    categories: attributes.tags ? attributes.tags.map(tag => ({
      id: `tag-${tag}`,
      title: tag
    })) : [],
  };
}

// Parse all markdown files in the content/posts directory
export function importAllPosts() {
  const context = import.meta.glob('/src/content/posts/*.md', { eager: true, as: 'raw' });
  
  const posts = Object.entries(context).map(([filePath, content]) => {
    // Extract the filename without the extension using string manipulation instead of path.basename
    const fileNameWithExtension = filePath.split('/').pop() || '';
    const slug = fileNameWithExtension.replace('.md', '');
    return parseMarkdownPost(slug, content as string);
  });

  // Sort by date (newest first)
  return posts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

// Get a single post by slug
export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = importAllPosts();
  return posts.find(post => post.slug === slug);
}
