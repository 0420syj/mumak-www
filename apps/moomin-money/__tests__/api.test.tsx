import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Testing with Jest Mocks', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should mock GET /api/hello', async () => {
    // Mock the fetch response
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        message: 'Hello from Jest Mock!',
        timestamp: '2024-01-01T00:00:00.000Z',
      }),
    } as Response);

    const response = await fetch('/api/hello');
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('/api/hello');
    expect(response.status).toBe(200);
    expect(data.message).toBe('Hello from Jest Mock!');
    expect(data.timestamp).toBeDefined();
  });

  it('should mock POST /api/counter increment', async () => {
    // Mock the fetch response
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        count: 1,
        action: 'increment',
      }),
    } as Response);

    const response = await fetch('/api/counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'increment' }),
    });
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('/api/counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'increment' }),
    });
    expect(response.status).toBe(200);
    expect(data.count).toBe(1);
    expect(data.action).toBe('increment');
  });

  it('should mock POST /api/counter decrement', async () => {
    // Mock the fetch response
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        count: -1,
        action: 'decrement',
      }),
    } as Response);

    const response = await fetch('/api/counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'decrement' }),
    });
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('/api/counter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'decrement' }),
    });
    expect(response.status).toBe(200);
    expect(data.count).toBe(-1);
    expect(data.action).toBe('decrement');
  });

  it('should mock GET /api/user', async () => {
    // Mock the fetch response
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      }),
    } as Response);

    const response = await fetch('/api/user');
    const data = await response.json();

    expect(fetch).toHaveBeenCalledWith('/api/user');
    expect(response.status).toBe(200);
    expect(data.id).toBe(1);
    expect(data.name).toBe('Test User');
    expect(data.email).toBe('test@example.com');
  });

  it('should handle API errors', async () => {
    // Mock a failed fetch response
    (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('Network error'));

    await expect(fetch('/api/error')).rejects.toThrow('Network error');
    expect(fetch).toHaveBeenCalledWith('/api/error');
  });
});
