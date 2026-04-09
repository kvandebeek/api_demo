import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('api-service', () => {
  const app = createApp();

  it('calculates valid expression', async () => {
    const response = await request(app).post('/calculate').send({ expression: '2+2*3' });
    expect(response.status).toBe(200);
    expect(response.body.result).toBe(8);
  });

  it('validates payload', async () => {
    const response = await request(app).post('/calculate').send({ wrong: true });
    expect(response.status).toBe(400);
  });

  it('returns errors for bad expression', async () => {
    const response = await request(app).post('/calculate').send({ expression: '2+a' });
    expect(response.status).toBe(422);
  });
});
