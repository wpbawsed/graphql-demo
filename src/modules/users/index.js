const { gql } = require('apollo-server-express')

const { getUsers } = require('./queries')

const { User, schema } = require('./model')

// The schema (feel free to split these in a subfolder if you'd like)
const typeDefs = gql`
  type Book {
    title: String
    author: String
  }
  extend type Query {
    book(id: ID!): Book @isAuthenticated
    books: [Book] @isAuthenticated
  }
`

module.exports = {
    User,
    users: {
        // typeDefs is an array, because it should be possible to split your schema if the schema grows to big, you can just export multiple here
        typeDefs: [
            typeDefs
        ],
        resolvers: {
            Query: {
                users: getUsers
            },
            Mutation: {

            }
        }
    }
}
