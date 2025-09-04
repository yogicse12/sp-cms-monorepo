import { Hono } from 'hono';
import { AuthService } from '../services/authService';
import type { Env } from '../types/env';

const auth = new Hono<{ Bindings: Env }>();

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
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
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
        is_active BOOLEAN DEFAULT 1
      )
    `
    ).run();

    return c.json({ message: 'Users table created successfully' });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// Debug route to check users in table
auth.get('/debug/users', async c => {
  try {
    const users = await c.env.DB.prepare(
      'SELECT id, email, name, created_at FROM users'
    ).all();
    return c.json({ users: users.results });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

export default auth;
