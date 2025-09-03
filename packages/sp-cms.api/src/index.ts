import { Hono } from 'hono';

const app = new Hono();

app.get('/', c => {
  return c.text('This is the SP CMS API Project');
});

export default app;
