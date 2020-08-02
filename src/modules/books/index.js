const { gql } = require('apollo-server-express')

const { getBooks, getBook } = require('./queries')
const { createBook } = require('./mutations')

const { Book, schema } = require('./model')

const typeDefs = gql`
  extend type Query {
    book(id: ID!): Book @isAuthenticated
    books: [Book] @isAuthenticated
  }
  extend type Mutation {
    createBook(
      title: String!
    ): Book
  }
  
  type Book {
    id: ID!
    title: String!
    createdBy: User!
    created: DateTime!
  }
`

module.exports = {
    Book,
    books: {
        typeDefs: [
            typeDefs
        ],
        resolvers: {
            Query: {
                book: getBook,
                books: getBooks
            },
            Mutation: {
                createBook
            }
        }
    }
}