const { gql } = require('apollo-server-express')

const { getTodos } = require('./queries')
const { createTodo } = require('./mutations')

const { Todo, schema } = require('./model')

// The schema (feel free to split these in a subfolder if you'd like)
const typeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    description: String!
    isCompleted: String!
  }
  
  extend type Query {
    todo(id: ID!): Todo
    todos: [Todo]
  }
  
  extend type Mutation {
    createTodo(
      title: String!
      description: String!
    ): Todo
  }
`

module.exports = {
    Todo,
    todos: {
        // typeDefs is an array, because it should be possible to split your schema if the schema grows to big, you can just export multiple here
        typeDefs: [
            typeDefs
        ],
        resolvers: {
            Query: {
                todos: getTodos
            },
            Mutation: {
                createTodo
            }
        }
    }
}
