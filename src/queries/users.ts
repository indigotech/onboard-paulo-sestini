import { CustomError } from '../error-handling';
import { User } from '../entity/user';

export async function users(_: unknown, args, context): Promise<User[]> {
  const loggedUserId = await context.userId;

  if (!loggedUserId) {
    throw new CustomError('Authentication failed.', 401, 'Missing JWT token.');
  }

  const quantity = args.quantity;

  const userRepository = User.getRepository();
  const users = await userRepository.find({
    order: { name: 'ASC' },
    take: quantity,
    skip: 0,
  });

  return users;
}
