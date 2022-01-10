import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { createConnection } from 'typeorm';
import { typeDefs } from './type-defs';
import { resolvers } from './resolvers';

export async function startServer() {
  try {
    const connection = await createConnection();
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: { connection },
    });

    const { url } = await server.listen();
    console.log(`Server ready at ${url}`);
  } catch (e) {
    console.error(e);
  }
}
