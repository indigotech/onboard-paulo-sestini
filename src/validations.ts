import { User } from './entity/user';
import { CustomError } from './error-handling';

export async function validateCreateUserInput(data) {
  const userRepository = User.getRepository();
  const letterRegex = /[a-zA-Z]/g;
  const digitRegex = /\d/g;

  if (data.password.length < 6) {
    throw new CustomError('Password is too short, needs at least 6 characters.', 400);
  }

  if (!letterRegex.test(data.password)) {
    throw new CustomError('Password needs at least 1 letter.', 400);
  }

  if (!digitRegex.test(data.password)) {
    throw new CustomError('Password needs at least 1 digit.', 400);
  }

  if ((await userRepository.count({ email: data.email })) > 0) {
    throw new CustomError('Email is already in use.', 400);
  }
}
