import { http, HttpResponse } from 'msw';

// Example API handlers
export const handlers = [
  // GET /api/hello
  http.get('/api/hello', () => {
    return HttpResponse.json({
      message: 'Hello from MSW!',
      timestamp: new Date().toISOString(),
    });
  }),

  // POST /api/counter
  http.post('/api/counter', async ({ request }) => {
    const { action } = await request.json();

    if (action === 'increment') {
      return HttpResponse.json({ count: 1, action: 'increment' });
    } else if (action === 'decrement') {
      return HttpResponse.json({ count: -1, action: 'decrement' });
    }

    return HttpResponse.json({ count: 0, action: 'reset' });
  }),

  // GET /api/user
  http.get('/api/user', () => {
    return HttpResponse.json({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    });
  }),
];
