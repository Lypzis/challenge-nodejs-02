import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { knex } from '../database';
import { checkSessionIdExistence } from '../middlewares/checkSessionIdExistence';

// Cookies = ways to keep context between requests

// unit tests: an application unit
// integration: communication between two or more units
// e2e: end to end, simulate user operating the application

// the user of the backend is the frontend :D
// back-end test: http requests, websockets

// Test Piramid: E2E -> slow test

export async function transactionRoutes(app: FastifyInstance) {
  // a global middleware, in this context(transactions)
  //   app.addHook('preHandler', async (request, reply) => {
  //     console.log(`[${request.method}] ${request.url}`);
  //   });

  app.get(
    '/',
    // preHandler = middleware, but in fastify
    { preHandler: [checkSessionIdExistence] },
    async request => {
      const { sessionId } = request.cookies;

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select();

      // send it as object, in case of additional information needed in future
      return { transactions };
    }
  );

  app.get('/:id', { preHandler: [checkSessionIdExistence] }, async request => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const { sessionId } = request.cookies;

    const transaction = await knex('transactions')
      .where({ id, session_id: sessionId })
      .first();

    return { transaction };
  });

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExistence] },
    async request => {
      const { sessionId } = request.cookies;

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first();

      return { summary };
    }
  );

  app.post('/', async (request, reply) => {
    // zod for type inference and validation
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : -amount,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
