import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    user(id: Int): User
    users(quantity: Int = 10, skip: Int = 0): UserList
  }

  type Mutation {
    createUser(data: UserInput): User
    login(email: String, password: String, rememberMe: Boolean = false): LoginInfo
  }

  type User {
    id: Int!
    name: String!
    email: String!
    birthDate: String!
    addresses: [Address!]
  }

  type Address {
    id: Int!
    cep: String!
    street: String!
    streetNumber: Int!
    complement: String
    neighborhood: String!
    city: String!
    state: String!
  }

  type LoginInfo {
    user: User!
    token: String!
  }

  type UserList {
    users: [User!]
    quantity: Int!
    hasBefore: Boolean!
    hasAfter: Boolean!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    birthDate: String!
  }
`;
