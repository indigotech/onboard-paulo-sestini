import { createUser } from './mutations/create-user';
import { login } from './mutations/login';
import { user } from './queries/user';

export const resolvers = {
  Query: {
    user,
  },

  Mutation: {
    createUser,
    login,
  },
};
