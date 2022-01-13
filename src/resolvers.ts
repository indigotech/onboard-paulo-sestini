import { createUser } from './mutations/create-user';
import { login } from './mutations/login';

export const resolvers = {
  Query: {},

  Mutation: {
    createUser,
    login,
  },
};
