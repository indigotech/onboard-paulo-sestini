/* eslint-disable @typescript-eslint/no-unused-vars */
import { Connection } from 'typeorm';
import { User } from './entity/user';
import { CustomError } from './error-handling';
import { hashPassword, validatePassword } from './hash';
import { generateJwt } from './token';
import { validateCreateUserInput } from './validations';

export const resolvers = {
  Query: {
    hello: () => {
      return 'Hello, world!';
    },
  },

  Mutation: {
    createUser: async (parent, args, context, info) => {
      const { data } = args;
      const connection: Connection = context.connection;

      await validateCreateUserInput(data, connection);

      const user = new User();
      data.password = await hashPassword(data.password);
      user.create(data);

      await connection.manager.save(user);

      return user;
    },

    login: async (parent, args, context, info) => {
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
    },
  },
};
