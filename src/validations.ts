import { Connection } from 'typeorm';
import { User } from './entity/user';
import { CustomError } from './error-handling';

export async function validateCreateUserInput(data, connection: Connection) {
  const letterRegex = /[a-zA-Z]/g;
  const digitRegex = /\d/g;

  if (data.password.length < 6) {
    throw new CustomError('Password is too short, needs at least 6 characters.', 400);
  }

  if (!letterRegex.test(data.password)) {
    throw new CustomError('Password needs at least 1 character', 400);
  }

  if (!digitRegex.test(data.password)) {
    throw new CustomError('Password needs at least 1 digit', 400);
  }

  if ((await connection.manager.count(User, { where: { email: data.email } })) > 0) {
    throw new CustomError('Email is already in use', 400);
  }
}
