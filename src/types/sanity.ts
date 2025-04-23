
export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

export interface Author {
  _id: string;
  name: string;
  image?: SanityImage;
  bio?: string;
}

export interface Category {
  _id: string;
  title: string;
  description?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  mainImage?: SanityImage;
  categories?: Category[];
  author?: Author;
  excerpt?: string;
  body?: any; // This will contain the Portable Text content
}
