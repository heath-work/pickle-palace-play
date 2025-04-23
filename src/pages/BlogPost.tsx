
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { urlFor } from '@/integrations/sanity/client';
import { useSanityPost } from '@/hooks/useSanityPosts';
import { format } from 'date-fns';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useSanityPost(slug || '');

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/blog" className="inline-flex items-center text-pickleball-blue mb-8 hover:underline">
          ← Back to Blog
        </Link>

        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading blog post...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>Failed to load blog post. Please try again later.</p>
          </div>
        ) : !post ? (
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
            <p>The blog post you're looking for doesn't exist or has been removed.</p>
          </div>
        ) : (
          <article>
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-pickleball-blue mb-4">{post.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-6">
                {post.publishedAt && (
                  <time dateTime={post.publishedAt} className="text-sm">
                    {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}
                  </time>
                )}
                
                {post.categories && post.categories.length > 0 && (
                  <div className="flex items-center ml-4">
                    <span className="mx-2">•</span>
                    <span className="text-sm">{post.categories.map(c => c.title).join(', ')}</span>
                  </div>
                )}
              </div>
              
              {post.author && (
                <div className="flex items-center">
                  {post.author.image && (
                    <img
                      src={urlFor(post.author.image.asset._ref)}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  )}
                  <span className="font-medium">By {post.author.name}</span>
                </div>
              )}
            </header>
            
            {post.mainImage && (
              <div className="mb-8">
                <img
                  src={urlFor(post.mainImage.asset._ref)}
                  alt={post.mainImage.alt || post.title}
                  className="w-full h-auto max-h-96 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="prose prose-lg max-w-none">
              {/* This is where we would render the Portable Text content */}
              {/* For now, just displaying the excerpt */}
              <p>{post.excerpt}</p>
              <p className="text-gray-500 italic mt-4">
                Note: To fully render the Portable Text content, you'll need to install 
                and configure @portabletext/react
              </p>
            </div>
          </article>
        )}
      </div>
    </Layout>
  );
};

export default BlogPost;
