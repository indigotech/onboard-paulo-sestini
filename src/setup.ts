import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { createConnection } from 'typeorm';
import { typeDefs } from './type-defs';
import { resolvers } from './resolvers';

export async function startServer() {
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
