import { Hono } from 'hono';
import { authenticate } from '../middleware/auth';
import { AuthService } from '../services/authService';
import type { Env } from '../types/env';

type AuthContext = {
  Bindings: Env;
  Variables: {
    user: any;
  };
};

const auth = new Hono<AuthContext>();

auth.post('/register', async c => {
  try {
    const requestData = await c.req.json();
    const result = await AuthService.registerUser(requestData, c.env);

    return c.json(result, 201);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON payload';
    return c.json({ error: errorMessage }, 400);
  }
});

auth.post('/login', async c => {
  try {
    const requestData = await c.req.json();
    const result = await AuthService.login(requestData, c.env);

    return c.json(result, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON payload';

    if (errorMessage.includes('User is not active')) {
      return c.json({ error: 'User is not active' }, 401);
    }

    if (
      errorMessage.includes('User not found') ||
      errorMessage.includes('Invalid password')
    ) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    return c.json({ error: errorMessage }, 400);
  }
});

// Debug route to check database structure
auth.get('/debug/tables', async c => {
  try {
    const tables = await c.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'"
    ).all();
    return c.json({ tables: tables.results });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// Migration route to create users table
auth.post('/debug/migrate', async c => {
  try {
    await c.env.DB.prepare(
      `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        is_active BOOLEAN DEFAULT 1
      )
    `
    ).run();

    return c.json({ message: 'Users table created successfully' });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// Migration route to add updated_at column if it doesn't exist
auth.post('/debug/add-updated-at', async c => {
  try {
    await c.env.DB.prepare(
      `ALTER TABLE users ADD COLUMN updated_at TEXT`
    ).run();

    return c.json({ message: 'Updated_at column added successfully' });
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Column may already exist',
      },
      500
    );
  }
});

// Migration route to add image_url column if it doesn't exist
auth.post('/debug/add-image-url', async c => {
  try {
    await c.env.DB.prepare(`ALTER TABLE users ADD COLUMN image_url TEXT`).run();

    return c.json({ message: 'image_url column added successfully' });
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error ? error.message : 'Column may already exist',
      },
      500
    );
  }
});

// Debug route to check users in table
auth.get('/debug/users', async c => {
  try {
    const users = await c.env.DB.prepare(
      'SELECT id, email, name, image_url, created_at FROM users'
    ).all();
    return c.json({ users: users.results });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

// Protected route example
auth.get('/profile', authenticate, async c => {
  const user = c.get('user');
  return c.json({
    message: 'Profile accessed successfully',
    user,
  });
});

// Change password route
auth.put('/change-password', authenticate, async c => {
  try {
    const user = c.get('user');
    const requestData = await c.req.json();
    const result = await AuthService.changePassword(
      user.userId,
      requestData,
      c.env
    );

    return c.json(result, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid JSON payload';

    // Handle specific error codes from service
    if (errorMessage.includes('User not found')) {
      return c.json({ error: 'User not found' }, 404);
    }
    if (
      errorMessage.includes('Invalid old password') ||
      errorMessage.includes('Invalid current password')
    ) {
      return c.json({ error: 'Invalid current password' }, 400);
    }
    if (errorMessage.includes('Password must be')) {
      return c.json({ error: errorMessage }, 400);
    }

    return c.json({ error: errorMessage }, 500);
  }
});

// Deactivate user route
auth.put('/deactivate/user/:id', authenticate, async c => {
  try {
    const userId = c.req.param('id');
    const adminUser = c.get('user');
    const result = await AuthService.deactivateUser(
      userId,
      adminUser.userId,
      c.env
    );

    return c.json(result, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid request';

    // Handle specific error codes from service
    if (
      errorMessage.includes('not authorized') ||
      errorMessage.includes('You are not authorized')
    ) {
      return c.json({ error: 'You are not authorized' }, 400);
    }
    if (errorMessage.includes('User ID is required')) {
      return c.json({ error: 'User ID is required' }, 400);
    }
    if (errorMessage.includes('User not found')) {
      return c.json({ error: 'User not found' }, 404);
    }
    if (errorMessage.includes('Failed to deactivate')) {
      return c.json({ error: 'Failed to deactivate user' }, 500);
    }

    return c.json({ error: errorMessage }, 500);
  }
});

// Activate user route
auth.put('/activate/user/:id', authenticate, async c => {
  try {
    const userId = c.req.param('id');
    const adminUser = c.get('user');
    const result = await AuthService.activateUser(
      userId,
      adminUser.userId,
      c.env
    );

    return c.json(result, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid request';

    // Handle specific error codes from service
    if (
      errorMessage.includes('not authorized') ||
      errorMessage.includes('You are not authorized')
    ) {
      return c.json({ error: 'You are not authorized' }, 400);
    }
    if (errorMessage.includes('User ID is required')) {
      return c.json({ error: 'User ID is required' }, 400);
    }
    if (errorMessage.includes('User not found')) {
      return c.json({ error: 'User not found' }, 404);
    }
    if (errorMessage.includes('Failed to activate')) {
      return c.json({ error: 'Failed to activate user' }, 500);
    }

    return c.json({ error: errorMessage }, 500);
  }
});

// Reset password route
auth.put('/reset-password', authenticate, async c => {
  try {
    const adminUser = c.get('user');
    const requestData = await c.req.json();
    const result = await AuthService.resetPassword(
      requestData,
      adminUser.userId,
      c.env
    );

    return c.json(result, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Invalid request';

    // Handle specific error codes from service
    if (
      errorMessage.includes('not authorized') ||
      errorMessage.includes('You are not authorized')
    ) {
      return c.json({ error: 'You are not authorized' }, 400);
    }
    if (errorMessage.includes('Email is required')) {
      return c.json({ error: 'Email is required' }, 400);
    }
    if (errorMessage.includes('New password is required')) {
      return c.json({ error: 'New password is required' }, 400);
    }
    if (errorMessage.includes('do not match')) {
      return c.json(
        { error: 'New password and confirm password do not match' },
        400
      );
    }
    if (errorMessage.includes('Password should be at least')) {
      return c.json({ error: errorMessage }, 400);
    }
    if (errorMessage.includes('User not found')) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ error: errorMessage }, 500);
  }
});

// Upload profile image route
auth.post('/upload-profile-image', authenticate, async c => {
  try {
    const user = c.get('user');

    // Check content type
    const contentType = c.req.header('Content-Type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return c.json({ error: 'Content-Type must be multipart/form-data' }, 400);
    }

    let formData;
    try {
      formData = await c.req.formData();
    } catch (parseError) {
      console.error('FormData parsing error:', parseError);
      return c.json({ error: 'Failed to parse form data' }, 400);
    }

    const file = formData.get('image') as File;

    if (!file || !file.name) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 5MB' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await AuthService.updateProfileImage(
      user.userId,
      {
        file: arrayBuffer,
        fileName: file.name,
        contentType: file.type,
      },
      c.env
    );

    return c.json(result, 200);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Image upload failed';

    console.error('Upload error:', error);
    return c.json({ error: errorMessage }, 500);
  }
});

// Serve images from R2
auth.get('/image/:path{.*}', async c => {
  try {
    const imagePath = c.req.param('path');

    if (!imagePath) {
      return c.json({ error: 'Image path is required' }, 400);
    }

    const object = await c.env.BUCKET.get(imagePath);

    if (!object) {
      return c.json({ error: 'Image not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000'); // Cache for 1 year

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    return c.json({ error: 'Failed to retrieve image' }, 500);
  }
});

export default auth;
