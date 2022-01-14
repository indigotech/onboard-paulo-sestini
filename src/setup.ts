import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { createConnection } from 'typeorm';
import { typeDefs } from './type-defs';
import { resolvers } from './resolvers';
import { formatError } from './error-handling';
import { getAuthenticatedUserId } from './authentication';

export async function startServer() {
  try {
    await startDatabase();
    const server = startApolloServer();

    const { url } = await server.listen();
    console.log(`Server ready at ${url}`);
  } catch (e) {
    console.error(e);
  }
}

function startDatabase() {
  return createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
    entities: ['src/entity/**/*.ts'],
    synchronize: true,
    logging: false,
  });
}

function startApolloServer() {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: getAuthenticatedUserId,
    formatError: formatError,
  });
}
