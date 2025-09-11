export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  publishedAt?: string;
  updatedAt: string;
  scheduledAt?: string;
  tags: string;
  featuredImage?: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface CreateBlogPostRequest {
  title: string;
  excerpt: string;
  content?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived' | 'scheduled';
  scheduledAt?: string;
  tags?: string;
  featuredImage?: string;
  isFeatured?: boolean; // defaults to false
}

export interface UpdateBlogPostRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  status?: 'draft' | 'published' | 'archived' | 'scheduled';
  scheduledAt?: string;
  tags?: string;
  featuredImage?: string;
  isFeatured?: boolean;
}
