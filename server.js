const { ApolloServer, gql } = require('apollo-server-express')
const express = require('express')

const app = express()

const { typeDefs, resolvers } = require('./GraphQLSchema');

const server = new ApolloServer({
    typeDefs,
    resolvers
});

// The GraphQL endpoint
server.applyMiddleware({
    path: '/',
    app
})

app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
)
