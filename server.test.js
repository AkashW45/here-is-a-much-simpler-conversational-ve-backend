let testApp;
jest.mock('express', () => {
  const actualExpress = jest.requireActual('express');
  const app = actualExpress();
  testApp = app;
  app.listen = jest.fn(() => ({ close: jest.fn() }));
  const mockExpress = jest.fn(() => app);
  Object.keys(actualExpress).forEach(key => {
    mockExpress[key] = actualExpress[key];
  });
  mockExpress.static = actualExpress.static;
  return mockExpress;
});

require('./server');
const request = require('supertest');

describe('Server', () => {
  test('GET /health returns 200 and ok status', async () => {
    const res = await request(testApp).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  test('GET /generate returns 10KB printable ASCII without Content-Disposition', async () => {
    const res = await request(testApp).get('/generate');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain;?\s*charset=utf-8/i);
    expect(res.headers['content-disposition']).toBeUndefined();

    const text = res.text;
    expect(text.length).toBe(10240);

    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      expect(code).toBeGreaterThanOrEqual(32);
      expect(code).toBeLessThanOrEqual(126);
    }
  });

  test('GET /api/generate works identically to /generate', async () => {
    const res = await request(testApp).get('/api/generate');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain;?\s*charset=utf-8/i);
    expect(res.headers['content-disposition']).toBeUndefined();
    expect(res.text.length).toBe(10240);
  });

  test('GET /generate returns only printable ASCII characters', async () => {
    const res = await request(testApp).get('/generate');
    const text = res.text;
    const nonPrintable = text.split('').some(char => {
      const code = char.charCodeAt(0);
      return code < 32 || code > 126;
    });
    expect(nonPrintable).toBe(false);
  });

  test('No Content-Disposition header on /api/generate', async () => {
    const res = await request(testApp).get('/api/generate');
    expect(res.headers['content-disposition']).toBeUndefined();
  });
});