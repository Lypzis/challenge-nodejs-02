import fastfy from 'fastify';

import { transactionRoutes } from './routes/transactions';
import fastifyCookie from '@fastify/cookie';

const app = fastfy();

app.register(fastifyCookie);

// this would apply to all routes
// app.addHook('preHandler', async (request, reply) => {
//   console.log(`[${request.method}] ${request.url}`);
// });

app.register(transactionRoutes, {
  prefix: 'transactions', // /transactions
});

export default app;
