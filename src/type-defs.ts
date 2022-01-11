import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    hello: String
  }

  type Mutation {
    createUser(data: UserInput): User
    login(email: String, password: String): LoginInfo
  }

  type User {
    id: Int!
    name: String!
    email: String!
    birthDate: String!
  }

  type LoginInfo {
    user: User!
    token: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }
`;
