import { Connection } from 'typeorm';
import { User } from './entity/user';
import { hashPassword } from './hash';
import { validateCreateUserInput } from './validations';

export const resolvers = {
  Query: {
    hello: () => {
      return 'Hello, world!';
    },
  },

  Mutation: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  },
};
