import { createUser } from './mutations/create-user';
import { login } from './mutations/login';
import { hello } from './queries/hello';

export const resolvers = {
  Query: {
    hello,
  },

  Mutation: {
    createUser,
    login,
  },
};
