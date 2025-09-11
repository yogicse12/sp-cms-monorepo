import { Hono } from 'hono';
import { authenticate } from '../middleware/auth';
import { BlogService } from '../services/blogService';
import type { Env } from '../types/env';
import type {
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from '../models/BlogPost';

type BlogContext = {
  Bindings: Env;
  Variables: {
    user: any;
  };
};

const blog = new Hono<BlogContext>();

blog.post('/add', authenticate, async c => {
  try {
    const requestData: CreateBlogPostRequest = await c.req.json();
    const user = c.get('user');

    const result = await BlogService.createBlogPost(
      requestData,
      user.email,
      c.env
    );

    return c.json(result, 201);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON payload';

    if (errorMessage.includes('slug already exists')) {
      return c.json({ error: errorMessage }, 409);
    }

    if (errorMessage.includes('required') || errorMessage.includes('must be')) {
      return c.json({ error: errorMessage }, 400);
    }

    return c.json({ error: errorMessage }, 400);
  }
});

// Get posts with pagination, filtering, and search
blog.get('/get-with-pagination', authenticate, async c => {
  try {
    // Get query parameters
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '10', 10);
    const status = c.req.query('status') as
      | 'draft'
      | 'published'
      | 'archived'
      | 'scheduled'
      | undefined;
    const search = c.req.query('search');

    // Validate status parameter if provided
    if (
      status &&
      !['draft', 'published', 'archived', 'scheduled'].includes(status)
    ) {
      return c.json(
        {
          error:
            'Invalid status. Must be one of: draft, published, archived, scheduled',
        },
        400
      );
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return c.json(
        {
          error:
            'Invalid pagination parameters. Page must be >= 1, limit must be 1-100',
        },
        400
      );
    }

    const result = await BlogService.getPostsWithPagination(
      { page, limit, status, search },
      c.env
    );

    return c.json(result, 200);
  } catch (error) {
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
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

blog.put('/update/:id', authenticate, async c => {
  try {
    const id = c.req.param('id');
    const requestData: UpdateBlogPostRequest = await c.req.json();

    const result = await BlogService.updatePost(id, requestData, c.env);

    return c.json(result, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON payload';

    if (errorMessage.includes('Post not found')) {
      return c.json({ error: errorMessage }, 404);
    }

    if (errorMessage.includes('already exists')) {
      return c.json({ error: errorMessage }, 409);
    }

    if (
      errorMessage.includes('required') ||
      errorMessage.includes('must be') ||
      errorMessage.includes('No fields to update')
    ) {
      return c.json({ error: errorMessage }, 400);
    }

    return c.json({ error: errorMessage }, 500);
  }
});

export default blog;
