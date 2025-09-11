import type { Env } from '../types/env';
import type {
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogPost,
} from '../models/BlogPost';

export interface CreateBlogPostResponse {
  success: boolean;
  message: string;
  id: string;
  slug: string;
}

export interface GetPostsQuery {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'archived' | 'scheduled';
  search?: string;
}

export interface PaginatedPostsResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class BlogService {
  static generateSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  static validateCreateBlogPostInput(
    data: CreateBlogPostRequest
  ): string | null {
    if (!data.title || !data.excerpt) {
      return 'Title and excerpt are required';
    }

    if (data.title.length < 3) {
      return 'Title must be at least 3 characters long';
    }

    if (data.excerpt.length < 10) {
      return 'Excerpt must be at least 10 characters long';
    }

    // Validate status if provided
    if (data.status) {
      const validStatuses = ['draft', 'published', 'archived', 'scheduled'];
      if (!validStatuses.includes(data.status)) {
        return 'Status must be one of: draft, published, archived, scheduled';
      }

      // If status is scheduled, scheduledAt must be provided
      if (data.status === 'scheduled' && !data.scheduledAt) {
        return 'scheduledAt is required when status is scheduled';
      }
    }

    return null;
  }

  static async createBlogPost(
    data: CreateBlogPostRequest,
    authorEmail: string,
    env: Env
  ): Promise<CreateBlogPostResponse> {
    const validationError = this.validateCreateBlogPostInput(data);
    if (validationError) {
      throw new Error(validationError);
    }

    // Generate ID, slug, and timestamps
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const slug = this.generateSlugFromTitle(data.title);
    const status = data.status || 'draft'; // Default to draft
    const publishedAt = status === 'published' ? now : null;
    const author = data.author || authorEmail;

    try {
      // Insert blog post into database
      const result = await env.DB.prepare(
        `
        INSERT INTO blog_posts (
          id, title, slug, excerpt, content, author, status, 
          publishedAt, updatedAt, scheduledAt, tags, featuredImage, 
          isFeatured, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
        .bind(
          id,
          data.title,
          slug,
          data.excerpt,
          data.content || '',
          author,
          status,
          publishedAt,
          now,
          data.scheduledAt || null,
          data.tags || '',
          data.featuredImage || null,
          data.isFeatured ?? false,
          now
        )
        .run();

      if (!result.success) {
        throw new Error(`Database error: ${result.error}`);
      }

      return {
        success: true,
        message: 'Blog post created successfully',
        id: id,
        slug: slug,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('UNIQUE constraint failed')) {
        // Try with a timestamp suffix if slug already exists
        const uniqueSlug = `${slug}-${Date.now()}`;
        try {
          const retryResult = await env.DB.prepare(
            `
            INSERT INTO blog_posts (
              id, title, slug, excerpt, content, author, status, 
              publishedAt, updatedAt, scheduledAt, tags, featuredImage, 
              isFeatured, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
          )
            .bind(
              id,
              data.title,
              uniqueSlug,
              data.excerpt,
              data.content || '',
              author,
              status,
              publishedAt,
              now,
              data.scheduledAt || null,
              data.tags || '',
              data.featuredImage || null,
              data.isFeatured ?? false,
              now
            )
            .run();

          if (retryResult.success) {
            return {
              success: true,
              message: 'Blog post created successfully',
              id: id,
              slug: uniqueSlug,
            };
          }
        } catch (retryError) {
          throw new Error('Failed to create blog post with unique slug');
        }
      }

      throw error;
    }
  }

  static async createBlogPostsTable(env: Env): Promise<{ message: string }> {
    try {
      await env.DB.prepare(
        `
        CREATE TABLE IF NOT EXISTS blog_posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          excerpt TEXT,
          content TEXT NOT NULL,
          author TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived', 'scheduled')),
          publishedAt TEXT,
          updatedAt TEXT NOT NULL,
          scheduledAt TEXT,
          tags TEXT,
          featuredImage TEXT,
          isFeatured BOOLEAN DEFAULT 0,
          createdAt TEXT NOT NULL
        )
      `
      ).run();

      return { message: 'Blog posts table created successfully' };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  static async getPostsWithPagination(
    query: GetPostsQuery,
    env: Env
  ): Promise<PaginatedPostsResponse> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10)); // Max 100, min 1, default 10
    const offset = (page - 1) * limit;

    try {
      // Build WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];

      // Filter by status
      if (query.status) {
        conditions.push('status = ?');
        params.push(query.status);
      }

      // Search by title
      if (query.search && query.search.trim()) {
        conditions.push('title LIKE ?');
        params.push(`%${query.search.trim()}%`);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM blog_posts ${whereClause}`;
      const countResult = await env.DB.prepare(countQuery)
        .bind(...params)
        .first();
      const total = (countResult as any)?.total || 0;

      // Get paginated posts
      const postsQuery = `
        SELECT 
          id, title, slug, excerpt, content, author, status, 
          publishedAt, updatedAt, scheduledAt, tags, featuredImage, 
          isFeatured, createdAt
        FROM blog_posts 
        ${whereClause}
        ORDER BY createdAt DESC
        LIMIT ? OFFSET ?
      `;

      const postsResult = await env.DB.prepare(postsQuery)
        .bind(...params, limit, offset)
        .all();

      const posts: BlogPost[] = (postsResult.results || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt || '',
        content: row.content,
        author: row.author,
        status: row.status as 'draft' | 'published' | 'archived' | 'scheduled',
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
        scheduledAt: row.scheduledAt,
        tags: row.tags || '',
        featuredImage: row.featuredImage,
        isFeatured: Boolean(row.isFeatured),
        createdAt: row.createdAt,
      }));

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);

      return {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch posts'
      );
    }
  }

  static async fetchPost(id: string, env: Env): Promise<BlogPost> {
    try {
      const postQuery = `
        SELECT 
          id, title, slug, excerpt, content, author, status, 
          publishedAt, updatedAt, scheduledAt, tags, featuredImage, 
          isFeatured, createdAt
        FROM blog_posts 
        WHERE id = ?
      `;

      const result = await env.DB.prepare(postQuery).bind(id).first();

      if (!result) {
        throw new Error('Post not found');
      }

      const post: BlogPost = {
        id: result.id as string,
        title: result.title as string,
        slug: result.slug as string,
        excerpt: (result.excerpt as string) || '',
        content: result.content as string,
        author: result.author as string,
        status: result.status as
          | 'draft'
          | 'published'
          | 'archived'
          | 'scheduled',
        publishedAt: result.publishedAt as string,
        updatedAt: result.updatedAt as string,
        scheduledAt: result.scheduledAt as string,
        tags: (result.tags as string) || '',
        featuredImage: result.featuredImage as string,
        isFeatured: Boolean(result.isFeatured),
        createdAt: result.createdAt as string,
      };

      return post;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch post'
      );
    }
  }

  static validateUpdateBlogPostInput(
    data: UpdateBlogPostRequest
  ): string | null {
    if (data.title && data.title.length < 3) {
      return 'Title must be at least 3 characters long';
    }

    if (data.excerpt && data.excerpt.length < 10) {
      return 'Excerpt must be at least 10 characters long';
    }

    if (data.status) {
      const validStatuses = ['draft', 'published', 'archived', 'scheduled'];
      if (!validStatuses.includes(data.status)) {
        return 'Status must be one of: draft, published, archived, scheduled';
      }

      if (data.status === 'scheduled' && !data.scheduledAt) {
        return 'scheduledAt is required when status is scheduled';
      }
    }

    return null;
  }

  static async updatePost(
    id: string,
    data: UpdateBlogPostRequest,
    env: Env
  ): Promise<{ success: boolean; message: string; post: BlogPost }> {
    const validationError = this.validateUpdateBlogPostInput(data);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      const existingPost = await this.fetchPost(id, env);

      const now = new Date().toISOString();

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.title !== undefined) {
        const newSlug = this.generateSlugFromTitle(data.title);
        updateFields.push('title = ?', 'slug = ?');
        updateValues.push(data.title, newSlug);
      }

      if (data.excerpt !== undefined) {
        updateFields.push('excerpt = ?');
        updateValues.push(data.excerpt);
      }

      if (data.content !== undefined) {
        updateFields.push('content = ?');
        updateValues.push(data.content);
      }

      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);

        if (data.status === 'published' && !existingPost.publishedAt) {
          updateFields.push('publishedAt = ?');
          updateValues.push(now);
        }
      }

      if (data.scheduledAt !== undefined) {
        updateFields.push('scheduledAt = ?');
        updateValues.push(data.scheduledAt);
      }

      if (data.tags !== undefined) {
        updateFields.push('tags = ?');
        updateValues.push(data.tags);
      }

      if (data.featuredImage !== undefined) {
        updateFields.push('featuredImage = ?');
        updateValues.push(data.featuredImage);
      }

      if (data.isFeatured !== undefined) {
        updateFields.push('isFeatured = ?');
        updateValues.push(data.isFeatured);
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateFields.push('updatedAt = ?');
      updateValues.push(now);

      const updateQuery = `
        UPDATE blog_posts 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      updateValues.push(id);

      const result = await env.DB.prepare(updateQuery)
        .bind(...updateValues)
        .run();

      if (!result.success) {
        throw new Error(`Database error: ${result.error}`);
      }

      if (!result.success) {
        throw new Error('Post not found or no changes made');
      }

      const updatedPost = await this.fetchPost(id, env);

      return {
        success: true,
        message: 'Post updated successfully',
        post: updatedPost,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('UNIQUE constraint failed')) {
        throw new Error('A post with this title already exists');
      }

      throw error;
    }
  }
}
