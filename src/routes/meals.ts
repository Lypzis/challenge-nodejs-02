import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { setupKnex } from '../database';
import getUserIdFromSession from '../middlewares/getUserIdFromSession';

export async function mealRoutes(app: FastifyInstance) {
  app.addHook('preHandler', getUserIdFromSession);

  app.get('/', async request => {
    const meals = await setupKnex('meals')
      .where('user_id', request.userId)
      .select();

    return { meals };
  });

  app.get('/:id', async request => {
    const deleteMealParamSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteMealParamSchema.parse(request.params);

    const [meal] = await setupKnex('meals')
      .where('id', id)
      .andWhere('user_id', request.userId)
      .select();

    return meal;
  });

  app.delete('/:id', async (request, reply) => {
    const deleteMealParamSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteMealParamSchema.parse(request.params);

    await setupKnex('meals')
      .delete()
      .where('id', id)
      .andWhere('user_id', request.userId);

    return reply.status(204).send();
  });

  app.put('/:id', async (request, reply) => {
    const editMealParamSchema = z.object({
      id: z.string().uuid(),
    });

    const editMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      is_in_diet: z.boolean().optional(),
    });

    const { id } = editMealParamSchema.parse(request.params);

    const { name, description, date, is_in_diet } = editMealBodySchema.parse(
      request.body
    );

    const mealId = await setupKnex('meals')
      .update({
        name,
        description,
        date,
        is_in_diet,
      })
      .where('id', id)
      .andWhere('user_id', request.userId)
      .returning('id');

    return reply.status(200).send(mealId.at(0));
  });

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      is_in_diet: z.boolean(),
    });

    const { name, description, date, is_in_diet } = createMealBodySchema.parse(
      request.body
    );

    const mealId = await setupKnex('meals')
      .insert({
        id: randomUUID(),
        name,
        description,
        date,
        is_in_diet,
        user_id: request.userId,
      })
      .returning('id');

    return reply.status(201).send(mealId.at(0));
  });
}
