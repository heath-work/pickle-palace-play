
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { format } from 'date-fns';
import { BlogPost } from '@/types/blog';

const BlogPostCard = ({ post }: { post: BlogPost }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.mainImage && (
        <img
          src={post.mainImage}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {format(new Date(post.publishedAt), 'MMM dd, yyyy')}
            </time>
          )}
          {post.categories && post.categories.length > 0 && (
            <>
              <span>•</span>
              <span>{post.categories[0].title}</span>
            </>
          )}
        </div>
        
        <h2 className="text-xl font-bold mb-2 text-pickleball-blue">{post.title}</h2>
        
        {post.excerpt && <p className="text-gray-600 mb-4">{post.excerpt}</p>}
        
        <div className="mt-4">
          <Link 
            to={`/blog/${post.slug}`}
            className="text-pickleball-blue hover:underline font-medium"
          >
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
};

const Blog = () => {
  const { data: posts, isLoading, error } = useBlogPosts();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-pickleball-blue">Pickle Palace Blog</h1>
          <p className="mt-4 text-xl text-gray-600">
            Latest news, tips, and stories from our pickleball community
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p>Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>Failed to load blog posts. Please try again later.</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p>No blog posts available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blog;
