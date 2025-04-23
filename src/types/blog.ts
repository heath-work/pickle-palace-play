
export interface Author {
  id: string;
  name: string;
  image?: string;
  bio?: string;
}

export interface Category {
  id: string;
  title: string;
  description?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  mainImage?: string;
  categories?: Category[];
  author?: Author;
  excerpt?: string;
  body?: string; // HTML content
}
