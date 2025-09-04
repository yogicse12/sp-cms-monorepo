import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './routes';

const app = new Hono();

app.use('*', cors());

app.get('/', c => {
  return c.text('This is the SP CMS API Project');
});

app.route('/api/auth', auth);

export default app;
