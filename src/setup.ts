import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { Connection, createConnection } from 'typeorm';
import { typeDefs } from './type-defs';
import { resolvers } from './resolvers';

export async function startServer() {
  try {
    const connection = await startDatabase();
    const server = startApolloServer(connection);

    const { url } = await server.listen();
    console.log(`Server ready at ${url}`);
  } catch (e) {
    console.error(e);
  }
}

async function startDatabase() {
  return await createConnection({
    type: 'postgres',
    url: process.env.DB_URL,
    entities: ['src/entity/**/*.ts'],
    synchronize: true,
    logging: false,
  });
}

function startApolloServer(connection: Connection) {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: { connection },
  });
}
