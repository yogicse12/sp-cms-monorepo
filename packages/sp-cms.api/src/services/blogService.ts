import type { Env } from '../types/env';
import type { CreateBlogPostRequest } from '../models/BlogPost';

export interface CreateBlogPostResponse {
  success: boolean;
  message: string;
  id: string;
  slug: string;
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
}
