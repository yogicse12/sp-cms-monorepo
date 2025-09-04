import { Hono } from 'hono';
import { AuthService } from '../services/authService';

const auth = new Hono();

auth.post('/register', async c => {
  try {
    const requestData = await c.req.json();
    const result = await AuthService.registerUser(requestData);

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
    const result = await AuthService.login(requestData);

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

export default auth;
