import { it, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest';
import { execSync } from 'node:child_process';
import request from 'supertest';
import app from '../src/app';

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Test Testerson Sigma da Bahia',
        email: 'testsigma@test.com',
        password: '123456',
        picture_path: '/bogus/url/to/picture.jpg',
      })
      .expect(201);
  });

  it('should be able to get user meal metrics', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Test Testerson Sigma da Bahia',
      email: 'testsigma@test.com',
      password: '123456',
      picture_path: '/bogus/url/to/picture.jpg',
    });

    const cookies = createUserResponse.get('Set-Cookie');

    const response = await request(app.server)
      .get('/users/metrics')
      .set('Cookie', String(cookies))
      .expect(200);

    expect(response.body).toHaveProperty('total_meals');
    expect(response.body).toHaveProperty('total_in_diet');
    expect(response.body).toHaveProperty('total_out_diet');
    expect(response.body).toHaveProperty('best_sequence_in_diet');
  });
});
