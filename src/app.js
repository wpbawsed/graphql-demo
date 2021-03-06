const express = require('express')

// The reason why apollo-server-express is because later on for testing we use Supertest, which requires an app object
const { ApolloServer } = require('apollo-server-express')

// we don't have these yet, but don't worry we'll get there.
const context = require('./utils/context')
const schema = require('./modules')

const server = new ApolloServer({
    schema,
    context: async ({ req }) => ({
        user: await context.getUser(req)
    })
})

const app = express()

server.applyMiddleware({
    path: '/graphql',
    app
})

module.exports = app
