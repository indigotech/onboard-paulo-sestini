import 'reflect-metadata';
import { ApolloServer, gql } from 'apollo-server';
import { createConnection } from 'typeorm';
import { User } from './entity/User';

createConnection()
  .then(async (connection) => {
    console.log('Inserting a new user into the database...');
    const user = new User();
    user.name = 'Paulo';
    user.email = 'paulo@gmail.com';
    user.password = 'password';
    user.birthDate = '01-01-2001';

    await connection.manager.save(user);
    console.log('Saved a new user with id: ' + user.id);

    console.log('Loading users from the database...');
    const users = await connection.manager.find(User);
    console.log('Loaded users: ', users);
  })
  .catch((error) => console.log(error));

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
    createUser: async (_, { data }) => {
      const user = new User();
      user.id = 20;
      user.name = data.name;
      user.email = data.email;
      user.password = data.password;
      user.birthDate = data.birthDate;
      return user;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
