const { gql } = require("apollo-server");

const typeDef = gql`
  type Book {
    title: String
    author: String
  }
  extend type Query {
    book(id: ID!): Book @isAuthenticated
    books: [Book] @isAuthenticated
  }
`;

module.exports = {
    typeDef
};
