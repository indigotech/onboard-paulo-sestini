import { User } from '../entity/user';
import { hashPassword } from '../hash';
import { validateCreateUserInput } from '../validations';

export async function createUser(_: unknown, args): Promise<User> {
  const { data } = args;

  await validateCreateUserInput(data);

  const user = new User();
  data.password = await hashPassword(data.password);
  user.create(data);

  const userRepository = User.getRepository();
  await userRepository.save(user);

  return user;
}
