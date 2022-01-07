import 'reflect-metadata';
import { ApolloServer, gql } from 'apollo-server';
import { createConnection, Connection } from 'typeorm';
import { User } from './entity/User';

const typeDefs = gql`
  type Query {
    hello: String
  }

  type Mutation {
    createUser(data: UserInput): User
  }

  type User {
    id: Int!
    name: String!
    email: String!
    birthDate: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }
`;

const resolvers = {
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

      const user = new User();
      user.name = data.name;
      user.email = data.email;
      user.password = data.password;
      user.birthDate = data.birthDate;

      await connection.manager.save(user);

      return user;
    },
  },
};

async function startServer() {
  const connection = await createConnection().catch((error) => console.log(error));
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: { connection: connection },
  });

  server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
  });
}

startServer();
