import 'reflect-metadata';
import { ApolloServer, gql } from 'apollo-server';
import { createConnection } from 'typeorm';
import { User } from './entity/User';

createConnection({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'localuser',
  password: 'admin',
  database: 'localdb',
  entities: [User],
  synchronize: true,
  logging: false,
})
  .then(async (connection) => {
    console.log('Inserting a new user into the database...');
    const user = new User();
    user.name = 'Paulo';
    user.email = 'paulo@gmail.com';
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
`;

const resolvers = {
  Query: {
    hello: () => {
      return 'Hello, world!';
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
