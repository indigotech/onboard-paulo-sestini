import contextParams from '../context-interface';
import { User } from '../entity/user';
import { CustomError } from '../error-handling';

interface getUserArgs {
  id: number;
}

export async function getUser(args: getUserArgs, context: contextParams): Promise<User> {
  const loggedUserId = await context.userId;

  if (!loggedUserId) {
    throw new CustomError('Authentication failed.', 401, 'Missing JWT token.');
  }

  const userIdToQuery = args.id;

  const user = await User.getRepository().findOne({ id: userIdToQuery });

  if (!user) {
    throw new CustomError('User not found.', 404);
  }

  return user;
}
