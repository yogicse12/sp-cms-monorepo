import { z } from 'zod';

// Blog Post Status Enum
export const BlogPostStatusSchema = z.enum([
  'draft',
  'published',
  'archived',
  'scheduled',
]);
export type BlogPostStatus = z.infer<typeof BlogPostStatusSchema>;

// Base Blog Post Schema
export const BlogPostSchema = z.object({
  id: z.uuid(),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(200, 'Title must be less than 200 characters'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z
    .string()
    .min(10, 'Excerpt must be at least 10 characters long')
    .max(500, 'Excerpt must be less than 500 characters'),
  content: z.string(),
  author: z.email('Author must be a valid email'),
  status: BlogPostStatusSchema,
  publishedAt: z.iso.datetime().nullable().optional(),
  updatedAt: z.iso.datetime(),
  scheduledAt: z.iso.datetime().nullable().optional(),
  tags: z.string().default(''),
  featuredImage: z.url().nullable().optional(),
  isFeatured: z.boolean().default(false),
  createdAt: z.iso.datetime(),
});

// Create Blog Post Request Schema
export const CreateBlogPostRequestSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters long')
      .max(200, 'Title must be less than 200 characters')
      .trim(),
    excerpt: z
      .string()
      .min(10, 'Excerpt must be at least 10 characters long')
      .max(500, 'Excerpt must be less than 500 characters')
      .trim(),
    content: z.string().default(''),
    author: z.email('Author must be a valid email').optional(),
    status: BlogPostStatusSchema.default('draft'),
    scheduledAt: z.iso.datetime().nullable().optional(),
    tags: z.string().default(''),
    featuredImage: z.url().nullable().optional(),
    isFeatured: z.boolean().default(false),
  })
  .refine(
    data => {
      // If status is scheduled, scheduledAt must be provided
      if (data.status === 'scheduled' && !data.scheduledAt) {
        return false;
      }
      return true;
    },
    {
      message: 'scheduledAt is required when status is scheduled',
      path: ['scheduledAt'],
    }
  );

// Update Blog Post Request Schema
export const UpdateBlogPostRequestSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters long')
      .max(200, 'Title must be less than 200 characters')
      .trim()
      .optional(),
    excerpt: z
      .string()
      .min(10, 'Excerpt must be at least 10 characters long')
      .max(500, 'Excerpt must be less than 500 characters')
      .trim()
      .optional(),
    content: z.string().optional(),
    status: BlogPostStatusSchema.optional(),
    scheduledAt: z.iso.datetime().nullable().optional(),
    tags: z.string().optional(),
    featuredImage: z.url().nullable().optional(),
    isFeatured: z.boolean().optional(),
  })
  .refine(
    data => {
      // If status is scheduled, scheduledAt must be provided
      if (data.status === 'scheduled' && !data.scheduledAt) {
        return false;
      }
      return true;
    },
    {
      message: 'scheduledAt is required when status is scheduled',
      path: ['scheduledAt'],
    }
  );

// Get Posts Query Schema
export const GetPostsQuerySchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  status: BlogPostStatusSchema.optional(),
  search: z.string().trim().optional(),
});

// Post ID Schema
export const PostIdSchema = z.object({
  id: z.uuid('Invalid post ID format'),
});

// Type exports (inferred from schemas for consistency)
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type CreateBlogPostRequest = z.infer<typeof CreateBlogPostRequestSchema>;
export type UpdateBlogPostRequest = z.infer<typeof UpdateBlogPostRequestSchema>;
export type GetPostsQuery = z.infer<typeof GetPostsQuerySchema>;
export type PostId = z.infer<typeof PostIdSchema>;
