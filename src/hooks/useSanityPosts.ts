
import { useQuery } from '@tanstack/react-query';
import { sanityClient } from '@/integrations/sanity/client';
import { BlogPost } from '@/types/sanity';

export function useSanityPosts() {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: async (): Promise<BlogPost[]> => {
      return sanityClient.fetch(`
        *[_type == "post"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          publishedAt,
          excerpt,
          mainImage,
          "categories": categories[]->{ _id, title, description },
          "author": author->{ _id, name, image, bio }
        }
      `);
    },
  });
}

export function useSanityPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async (): Promise<BlogPost | null> => {
      const posts = await sanityClient.fetch(`
        *[_type == "post" && slug.current == $slug] {
          _id,
          title,
          slug,
          publishedAt,
          excerpt,
          mainImage,
          body,
          "categories": categories[]->{ _id, title, description },
          "author": author->{ _id, name, image, bio }
        }
      `, { slug });
      
      return posts.length > 0 ? posts[0] : null;
    },
    enabled: !!slug,
  });
}
