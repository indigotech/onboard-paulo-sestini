const { ApolloServer, gql } = require('apollo-server');

var typeDefs = gql`
    type Query {
        hello: String
    }
`;

var resolvers = {
    Query: {
        hello: () => {
            return "Hello, world!";
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
