const request = require('supertest');

// Mock express.listen to prevent actual server start
let app;
jest.mock('express', () => {
  const actualExpress = jest.requireActual('express');
  app = actualExpress();
  app.listen = jest.fn().mockReturnThis();
  const mockExpress = jest.fn(() => app);
  mockExpress.static = actualExpress.static;
  return mockExpress;
});

// Silence console.log during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

// Load the server – this will use the mocked express and not bind a port
require('../server');

describe('Server endpoints', () => {
  // Happy path: Health check
  test('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  // Happy path: Generate 10KB random text
  test('GET /api/generate returns 200 with correct headers and 10240 bytes', async () => {
    const res = await request(app).get('/api/generate');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="random.txt"/);
    expect(Buffer.isBuffer(res.body) || typeof res.body === 'string').toBeTruthy();
    const bodyBuffer = Buffer.isBuffer(res.body) ? res.body : Buffer.from(res.body);
    expect(bodyBuffer.length).toBe(10240);
    // Verify all bytes are printable ASCII (32–126)
    for (const byte of bodyBuffer) {
      expect(byte).toBeGreaterThanOrEqual(32);
      expect(byte).toBeLessThanOrEqual(126);
    }
  });

  // Edge case: two calls produce different content
  test('GET /api/generate returns different content on subsequent calls', async () => {
    const res1 = await request(app).get('/api/generate');
    const res2 = await request(app).get('/api/generate');
    const body1 = Buffer.isBuffer(res1.body) ? res1.body : Buffer.from(res1.body);
    const body2 = Buffer.isBuffer(res2.body) ? res2.body : Buffer.from(res2.body);
    expect(body1.equals(body2)).toBe(false);
  });

  // Error path: wrong method on /api/generate
  test('POST /api/generate returns 404', async () => {
    const res = await request(app).post('/api/generate');
    expect(res.status).toBe(404);
  });

  // Error path: catch-all route when index.html not found (returns 500)
  test('GET /unknown-path returns 500 due to missing index.html', async () => {
    const res = await request(app).get('/unknown-path');
    expect(res.status).toBe(500);
  });
});