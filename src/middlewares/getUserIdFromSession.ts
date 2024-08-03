import { FastifyRequest, FastifyReply } from 'fastify';
import { setupKnex } from '../database';

async function getUserIdFromSession(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    reply.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const [user] = await setupKnex('users')
    .where('session_id', sessionId)
    .select('id');

  if (!user) {
    reply.status(401).send({ error: 'Unauthorized' });
    return;
  }

  request.userId = user.id;
}

export default getUserIdFromSession;
