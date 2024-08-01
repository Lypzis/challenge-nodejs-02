import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';
import request from 'supertest';
import app from '../src/app';

describe('Transactions routes', () => {
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

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'Test Transaction',
        amount: 50000,
        type: 'debit',
      })
      .expect(201);
  });

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Test Transaction',
        amount: 50000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', String(cookies))
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Test Transaction',
        amount: 50000,
      }),
    ]);
  });

  it('should be able to get a transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Test Transaction',
        amount: 50000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', String(cookies));

    const { id } = listTransactionsResponse.body.transactions.at(0);

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${id}`)
      .set('Cookie', String(cookies))
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'Test Transaction',
        amount: 50000,
      })
    );
  });

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit Transaction',
        amount: 50000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');

    await request(app.server)
      .post('/transactions')
      .set('Cookie', String(cookies))
      .send({
        title: 'Debit Transaction',
        amount: 25000,
        type: 'debit',
      });

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', String(cookies))
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({ amount: 25000 });
  });
});
