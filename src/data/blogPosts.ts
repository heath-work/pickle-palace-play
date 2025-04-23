
import { BlogPost, Category, Author } from '@/types/blog';

// Sample authors
export const authors: Author[] = [
  {
    id: '1',
    name: 'Heath Taskis',
    image: '/placeholder.svg',
    bio: 'Senior pickleball coach with over 10 years of experience in competitive play.'
  },
  {
    id: '2',
    name: 'Heath Taskis',
    image: '/placeholder.svg',
    bio: 'Professional pickleball player and certified instructor.'
  }
];

// Sample categories
export const categories: Category[] = [
  {
    id: '1',
    title: 'Tips & Tricks',
    description: 'Helpful advice to improve your pickleball game'
  },
  {
    id: '2',
    title: 'Equipment',
    description: 'Reviews and recommendations for pickleball equipment'
  },
  {
    id: '3',
    title: 'Events',
    description: 'Upcoming tournaments and pickleball events'
  }
];

// Sample blog posts
export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Top 5 Pickleball Strategies for Beginners',
    slug: 'top-5-pickleball-strategies-for-beginners',
    publishedAt: '2025-04-10T08:00:00Z',
    mainImage: '/placeholder.svg',
    categories: [categories[0]],
    author: authors[0],
    excerpt: 'Learn the essential strategies that will help beginners improve their pickleball game quickly.',
    body: `
      <p>Pickleball has become one of the fastest-growing sports in recent years, attracting players of all ages and skill levels. If you're new to the game, here are five essential strategies to help you improve quickly:</p>
      <h2>1. Master the Third Shot Drop</h2>
      <p>The third shot drop is a soft shot hit by the serving team after the return of serve. It's designed to drop into the non-volley zone (kitchen) and prevent your opponents from attacking. Practice this shot regularly as it's fundamental to advanced play.</p>
      <h2>2. Stay Patient at the Kitchen Line</h2>
      <p>Rushing to hit powerful shots often leads to errors. Instead, focus on controlled dinking at the kitchen line until you get a ball you can put away.</p>
      <h2>3. Communicate With Your Partner</h2>
      <p>Call "mine" or "yours" to avoid confusion, especially with balls down the middle. Effective communication prevents errors and builds teamwork.</p>
      <h2>4. Keep Your Paddle Up</h2>
      <p>Always keep your paddle up and ready in front of you. This reduces reaction time when your opponent hits a fast ball your way.</p>
      <h2>5. Move as a Team</h2>
      <p>In doubles, move laterally with your partner like you're connected by a string. This prevents gaps in your defense and improves court coverage.</p>
    `
  },
  {
    id: '2',
    title: 'Choosing the Right Pickleball Paddle',
    slug: 'choosing-the-right-pickleball-paddle',
    publishedAt: '2025-04-05T10:30:00Z',
    mainImage: '/placeholder.svg',
    categories: [categories[1]],
    author: authors[1],
    excerpt: 'A comprehensive guide to selecting the perfect pickleball paddle based on your playing style and preferences.',
    body: `
      <p>Selecting the right pickleball paddle can significantly impact your game. Here's what to consider when making your choice:</p>
      <h2>Weight Matters</h2>
      <p>Paddles typically range from 7 to 8.5 ounces. Lighter paddles offer more control and reduce fatigue, while heavier paddles provide more power with less effort.</p>
      <h2>Grip Size</h2>
      <p>A good rule of thumb: when you grip the paddle, there should be about 1/4 inch between your fingertips and your palm. Too large or small can cause strain or lack of control.</p>
      <h2>Core Material</h2>
      <p>Polymer cores offer the best control and soft touch, while Nomex cores provide more power but less touch. Aluminum cores fall somewhere in between.</p>
      <h2>Face Material</h2>
      <p>Composite faces give you more spin potential, while graphite faces are lighter and offer excellent touch for precise shots.</p>
      <h2>Test Before You Buy</h2>
      <p>Whenever possible, demo paddles before purchasing. What works for others may not work for you, so personal experience is invaluable.</p>
    `
  },
  {
    id: '3',
    title: 'Upcoming Summer Tournament at Pickle Palace',
    slug: 'upcoming-summer-tournament',
    publishedAt: '2025-04-15T09:45:00Z',
    mainImage: '/placeholder.svg',
    categories: [categories[2]],
    author: authors[0],
    excerpt: 'Join us for our annual summer pickleball tournament with prizes, food, and fun for all skill levels.',
    body: `
      <p>We're excited to announce our annual Summer Smash Tournament at Pickle Palace!</p>
      <h2>Event Details</h2>
      <p><strong>Date:</strong> July 15-17, 2025<br />
      <strong>Location:</strong> Pickle Palace Main Courts<br />
      <strong>Registration Deadline:</strong> July 1, 2025</p>
      <h2>Divisions</h2>
      <ul>
        <li>3.0 Mixed Doubles</li>
        <li>3.5 Mixed Doubles</li>
        <li>4.0+ Mixed Doubles</li>
        <li>Men's and Women's Doubles (3.0, 3.5, 4.0+)</li>
        <li>Singles (Open Division)</li>
      </ul>
      <h2>Prizes</h2>
      <p>Winners in each division will receive gift cards, premium pickleball equipment, and Pickle Palace membership discounts.</p>
      <h2>Registration</h2>
      <p>Register online through your member account or at the front desk. Entry fee is $25 per person per event. All participants receive a tournament t-shirt and lunch on Saturday.</p>
      <h2>Volunteers Needed</h2>
      <p>We're looking for volunteers to help with scorekeeping, registration, and court maintenance. Volunteers receive free lunch and a special thank-you gift!</p>
    `
  }
];

// Helper function to get a blog post by slug
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

