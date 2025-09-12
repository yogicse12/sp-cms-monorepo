import { Hono } from 'hono';
import { authenticate } from '../middleware/auth';
import { BlogService } from '../services/blogService';
import type { Env } from '../types/env';
import { ZodError } from 'zod';

type BlogContext = {
  Bindings: Env;
  Variables: {
    user: any;
  };
};

const blog = new Hono<BlogContext>();

blog.post('/add', authenticate, async c => {
  try {
    const requestData = await c.req.json();
    const user = c.get('user');

    const result = await BlogService.createBlogPost(
      requestData,
      user.email,
      c.env
    );

    return c.json(result, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          error: 'Validation failed',
          details: error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        400
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON payload';

    if (errorMessage.includes('slug already exists')) {
      return c.json({ error: errorMessage }, 409);
    }

    return c.json({ error: errorMessage }, 500);
  }
});

// Get posts with pagination, filtering, and search
blog.get('/get-with-pagination', authenticate, async c => {
  try {
    // Get query parameters
    const queryParams = {
      page: parseInt(c.req.query('page') || '1', 10),
      limit: parseInt(c.req.query('limit') || '10', 10),
      status: c.req.query('status'),
      search: c.req.query('search'),
    };

    const result = await BlogService.getPostsWithPagination(queryParams, c.env);

    return c.json(result, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          error: 'Invalid query parameters',
          details: error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        400
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch posts';
    return c.json({ error: errorMessage }, 500);
  }
});

// Migration route to create blog_posts table
blog.post('/debug/migrate', authenticate, async c => {
  try {
    const result = await BlogService.createBlogPostsTable(c.env);
    return c.json(result);
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

blog.get('/fetch/:id', authenticate, async c => {
  try {
    const id = c.req.param('id');
    const result = await BlogService.fetchPost(id, c.env);
    return c.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          error: 'Invalid post ID format',
          details: error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        400
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Post not found')) {
      return c.json({ error: errorMessage }, 404);
    }

    return c.json({ error: errorMessage }, 500);
  }
});

blog.put('/update/:id', authenticate, async c => {
  try {
    const id = c.req.param('id');
    const requestData = await c.req.json();

    const result = await BlogService.updatePost(id, requestData, c.env);

    return c.json(result, 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          error: 'Validation failed',
          details: error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        400
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON payload';

    if (errorMessage.includes('Post not found')) {
      return c.json({ error: errorMessage }, 404);
    }

    if (errorMessage.includes('already exists')) {
      return c.json({ error: errorMessage }, 409);
    }

    return c.json({ error: errorMessage }, 500);
  }
});

export default blog;
