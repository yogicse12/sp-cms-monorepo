import * as jwt from 'jsonwebtoken';
import type { Context, Next } from 'hono';
import type { Env } from '../types/env';

type AuthContext = {
  Bindings: Env;
  Variables: {
    user: any;
  };
};

export const authenticate = async (c: Context<AuthContext>, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, c.env.TOKEN_SECRET || 'default-secret');
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
