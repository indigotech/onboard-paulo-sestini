import { User } from '../entity/user';
import { CustomError } from '../error-handling';
import { validatePassword } from '../hash';
import { generateJwt } from '../token';

export async function login(_: unknown, args) {
  const { email, password, rememberMe } = args;
  const userRepository = User.getRepository();

  const user = await userRepository.findOne({ email });

  if (!user) {
    await validatePassword(password, '98sldkj2387');
    throw new CustomError('Invalid email or password. Please, try again.', 401);
  }

  const passwordCheck = await validatePassword(password, user.password);

  if (!passwordCheck) {
    throw new CustomError('Invalid email or password. Please, try again.', 401);
  }

  return {
    user,
    token: generateJwt(user, rememberMe),
  };
}
