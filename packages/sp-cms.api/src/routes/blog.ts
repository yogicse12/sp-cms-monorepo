import { Hono } from 'hono';
import { authenticate } from '../middleware/auth';
import { BlogService } from '../services/blogService';
import type { Env } from '../types/env';
import type { CreateBlogPostRequest } from '../models/BlogPost';

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

export default blog;
