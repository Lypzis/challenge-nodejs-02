import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';
import request from 'supertest';
import app from '../src/app';

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready(); // will wait for the server to be ready/started
  });

  afterAll(async () => {
    await app.close();
  });

  // for each test erase the entire TEST db, and create anew
  // to avoid test conflict with the data
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Test Testerson Sigma da Bahia',
      email: 'testsigma@test.com',
      password: '123456',
      picture_path: '/bogus/url/to/picture.jpg',
    });

    const cookies = createUserResponse.get('Set-Cookie');

    const response = await request(app.server)
      .post('/meals')
      .set('Cookie', String(cookies))
      .send({
        name: 'Salad',
        description: 'A healthy salad',
        date: '2024-08-02T12:00:00Z',
        is_in_diet: true,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Test Testerson Sigma da Bahia',
      email: 'testsigma@test.com',
      password: '123456',
      picture_path: '/bogus/url/to/picture.jpg',
    });

    const cookies = createUserResponse.get('Set-Cookie');

    await request(app.server)
      .post('/meals')
      .set('Cookie', String(cookies))
      .send({
        name: 'Salad',
        description: 'A healthy salad',
        date: '2024-08-02T12:00:00Z',
        is_in_diet: true,
      });

    const mealsListResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', String(cookies))
      .expect(200);

    expect(mealsListResponse.body.meals).toEqual([
      expect.objectContaining({
        id: mealsListResponse.body.meals[0].id,
        name: 'Salad',
        description: 'A healthy salad',
        date: '2024-08-02T12:00:00Z',
        is_in_diet: 1,
      }),
    ]);
  });

  it('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Test Testerson Sigma da Bahia',
      email: 'testsigma@test.com',
      password: '123456',
      picture_path: '/bogus/url/to/picture.jpg',
    });

    const cookies = createUserResponse.get('Set-Cookie');

    await request(app.server)
      .post('/meals')
      .set('Cookie', String(cookies))
      .send({
        name: 'Salad',
        description: 'A healthy salad',
        date: '2024-08-02T12:00:00Z',
        is_in_diet: false,
      });

    const mealsListResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', String(cookies));

    const { id } = mealsListResponse.body.meals.at(0);

    const getMealResponse = await request(app.server)
      .put(`/meals/${id}`)
      .set('Cookie', String(cookies))
      .send({
        name: 'Salad Caesar',
        description: 'A healthy salad',
        date: '2024-08-02T12:00:00Z',
        is_in_diet: true,
      })
      .expect(200);

    expect(getMealResponse.body).toEqual(
      expect.objectContaining({
        id,
      })
    );
  });

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Test Testerson Sigma da Bahia',
      email: 'testsigma@test.com',
      password: '123456',
      picture_path: '/bogus/url/to/picture.jpg',
    });

    const cookies = createUserResponse.get('Set-Cookie');

    await request(app.server)
      .post('/meals')
      .set('Cookie', String(cookies))
      .send({
        name: 'Salad',
        description: 'A healthy salad',
        date: '2024-08-02T12:00:00Z',
        is_in_diet: false,
      });

    const mealsListResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', String(cookies));

    const { id } = mealsListResponse.body.meals.at(0);

    await request(app.server)
      .delete(`/meals/${id}`)
      .set('Cookie', String(cookies))
      .expect(204);
  });

  it('should be able to get a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Test Testerson Sigma da Bahia',
      email: 'testsigma@test.com',
      password: '123456',
      picture_path: '/bogus/url/to/picture.jpg',
    });

    const cookies = createUserResponse.get('Set-Cookie');

    await request(app.server)
      .post('/meals')
      .set('Cookie', String(cookies))
      .send({
        name: 'Salad',
        description: 'A healthy salad',
        date: '2024-08-02T12:00:00Z',
        is_in_diet: false,
      });

    const mealsListResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', String(cookies));

    const { id } = mealsListResponse.body.meals.at(0);

    const mealsResponse = await request(app.server)
      .get(`/meals/${id}`)
      .set('Cookie', String(cookies))
      .expect(200);

    expect(mealsResponse.body).toEqual(
      expect.objectContaining({
        name: 'Salad',
        description: 'A healthy salad',
        date: '2024-08-02T12:00:00Z',
        is_in_diet: 0,
      })
    );
  });
});
