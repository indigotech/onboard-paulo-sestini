import { createUser } from './mutations/create-user';
import { login } from './mutations/login';
import { getUser } from './queries/user';
import { users } from './queries/users';

export const resolvers = {
  Query: {
    user: (_: unknown, args, context) => getUser(args, context),
    users,
  },

  Mutation: {
    createUser: (_: unknown, args, context) => createUser(args, context),
    login: (_: unknown, args) => login(args),
  },
};
