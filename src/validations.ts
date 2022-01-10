import { UserInputError } from 'apollo-server';
import { Connection } from 'typeorm';
import { User } from './entity/user';

export async function validateCreateUserInput(data, connection: Connection) {
  const letterRegex = /[a-zA-Z]/g;
  const digitRegex = /\d/g;

  if (data.password.length < 6) {
    throw new UserInputError('Password is too short, needs at least 6 characters.');
  }

  if (!letterRegex.test(data.password)) {
    throw new UserInputError('Password needs at least 1 character');
  }

  if (!digitRegex.test(data.password)) {
    throw new UserInputError('Password needs at least 1 digit');
  }

  if ((await connection.manager.count(User, { where: { email: data.email } })) > 0) {
    throw new UserInputError('Email is already in use');
  }
}
