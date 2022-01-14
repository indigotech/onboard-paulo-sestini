import contextParams from '../context-interface';
import { User } from '../entity/user';
import { CustomError } from '../error-handling';
import { hashPassword } from '../hash';
import { validateCreateUserInput } from '../validations';

interface createUserArgs {
  data: {
    name: string;
    email: string;
    password: string;
    birthDate: string;
  };
}

export async function createUser(args: createUserArgs, context: contextParams): Promise<User> {
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
