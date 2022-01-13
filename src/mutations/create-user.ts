import { User } from '../entity/user';
import { CustomError } from '../error-handling';
import { hashPassword } from '../hash';
import { validateCreateUserInput } from '../validations';

export async function createUser(_: unknown, args, context): Promise<User> {
  const loggedUserId = await context.userId;

  if (!loggedUserId) {
    throw new CustomError('Authentication failed.', 401, 'Missing JWT token.');
  }

  const { data } = args;

  await validateCreateUserInput(data);

  const user = new User();
  data.password = await hashPassword(data.password);
  user.create(data);

  const userRepository = User.getRepository();
  await userRepository.save(user);

  return user;
}
