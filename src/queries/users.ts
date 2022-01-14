import { CustomError } from '../error-handling';
import { User } from '../entity/user';
import contextParams from '../context-interface';

interface getUsersArgs {
  quantity: number;
  skip: number;
}

export async function getUsers(args: getUsersArgs, context: contextParams) {
  const loggedUserId = await context.userId;

  if (!loggedUserId) {
    throw new CustomError('Authentication failed.', 401, 'Missing JWT token.');
  }

  const { quantity, skip } = args;

  const userRepository = User.getRepository();
  const users = await userRepository.find({
    order: { name: 'ASC' },
    take: quantity,
    skip: skip,
  });

  const totalNumberOfUsers = await userRepository.count();

  return {
    users,
    quantity: users.length,
    hasBefore: skip != 0,
    hasAfter: skip + users.length < totalNumberOfUsers,
  };
}
