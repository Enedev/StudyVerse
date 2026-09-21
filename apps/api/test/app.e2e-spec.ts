import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('Health endpoint (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable-key';
    process.env.SUPABASE_SECRET_KEY = 'test-secret-key';
    process.env.SUPABASE_JWKS_URL =
      'https://example.supabase.co/auth/v1/.well-known/jwks.json';
    const { AppModule } = await import('./../src/app.module.js');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('ok');
        expect(body.service).toBe('studyverse-api');
      });
  });

  it('protects task and calendar endpoints', async () => {
    await request(app.getHttpServer()).get('/api/v1/tasks').expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/calendar/events')
      .query({
        from: '2026-09-01T00:00:00.000Z',
        to: '2026-10-01T00:00:00.000Z',
      })
      .expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
