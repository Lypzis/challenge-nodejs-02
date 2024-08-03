import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { setupKnex } from '../database';
import getUserIdFromSession from '../middlewares/getUserIdFromSession';
import {
  TotalMealsResult,
  TotalInDietResult,
  TotalOutDietResult,
} from '../types/metrics';

export async function userRoutes(app: FastifyInstance) {
  app.get(
    '/metrics',
    { preHandler: [getUserIdFromSession] },
    async (request, reply) => {
      const userId = request.userId;

      const totalMealsResult = await setupKnex<TotalMealsResult>('meals')
        .where('user_id', userId)
        .count<{ total_meals: string }>('id as total_meals')
        .first();

      const totalInDietResult = await setupKnex<TotalInDietResult>('meals')
        .where('user_id', userId)
        .andWhere('is_in_diet', true)
        .count<{ total_in_diet: string }>('id as total_in_diet')
        .first();

      const totalOutDietResult = await setupKnex<TotalOutDietResult>('meals')
        .where('user_id', userId)
        .andWhere('is_in_diet', false)
        .count<{ total_out_diet: string }>('id as total_out_diet')
        .first();

      // Use optional chaining and default values to handle undefined results
      const totalMeals = totalMealsResult
        ? parseInt(totalMealsResult.total_meals, 10)
        : 0;
      const totalInDiet = totalInDietResult
        ? parseInt(totalInDietResult.total_in_diet, 10)
        : 0;
      const totalOutDiet = totalOutDietResult
        ? parseInt(totalOutDietResult.total_out_diet, 10)
        : 0;

      const meals = await setupKnex('meals')
        .where('user_id', userId)
        .select('is_in_diet')
        .orderBy('date');

      let bestSequenceInDiet = 0;
      let currentSequence = 0;

      for (const meal of meals) {
        if (meal.is_in_diet) {
          currentSequence++;
          bestSequenceInDiet = Math.max(bestSequenceInDiet, currentSequence);
        } else {
          currentSequence = 0;
        }
      }

      const metrics = {
        total_meals: totalMeals,
        total_in_diet: totalInDiet,
        total_out_diet: totalOutDiet,
        best_sequence_in_diet: bestSequenceInDiet,
      };

      return reply.status(200).send(metrics);
    }
  );

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
      picture_path: z.string().optional(),
    });

    let { name, email, password, picture_path } = createUserBodySchema.parse(
      request.body
    );

    // user receive a new unique session id at creation
    // if login was implemented, a new session would be given to the a existing user
    // not the case here
    const sessionId = randomUUID();

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const user = {
      id: randomUUID(),
      name,
      email,
      password,
      picture_path,
      session_id: sessionId,
    };

    const userId = await setupKnex('users').insert(user).returning('id'); // 'id'

    return reply.status(201).send(JSON.stringify(userId.at(0)));
  });
}
