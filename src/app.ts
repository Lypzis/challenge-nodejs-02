import fastfy from 'fastify';

import { userRoutes } from './routes/users';
import { mealRoutes } from './routes/meals';
import fastifyCookie from '@fastify/cookie';

const app = fastfy();

app.register(fastifyCookie);

app.register(userRoutes, {
  prefix: 'users',
});

app.register(mealRoutes, {
  prefix: 'meals',
});

export default app;
