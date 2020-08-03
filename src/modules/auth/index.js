const { gql } = require('apollo-server-express')

const { me } = require('./queries')
const { login, signUp } = require('./mutations')

// The schema (feel free to split these in a subfolder if you'd like)
const typeDefs = gql`
  extend type Query {
    me: User @isAuthenticated
  }
  
  extend type Mutation {
    login(
      email: String!,
      password: String!
    ): AuthData
    
    signUp(
      email: String!,
      password: String!,
      firstName: String!,
      lastName: String!
    ): User
  }
  
  type AuthData {
    user: User
    token: String!
    tokenExpiration: String!
  }
`

module.exports = {
    auth: {
        // typeDefs is an array, because it should be possible to split your schema if the schema grows to big, you can just export multiple here
        typeDefs: [
            typeDefs
        ],
        resolvers: {
            Query: {
                me
            },
            Mutation: {
                login,
                signUp
            }
        }
    }
}
