import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth, blog } from './routes';

const app = new Hono();

app.use('*', cors());

app.get('/', c => {
  return c.text('This is the SP CMS API Project');
});

app.route('/api/auth', auth);
app.route('/api/post', blog);

export default app;
