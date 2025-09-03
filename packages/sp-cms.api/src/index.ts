import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
return c.text('Hello from SP CMS API');
});

export default app;