const express = require('express')

// The reason why apollo-server-express is because later on for testing we use Supertest, which requires an app object
const graphqlHTTP = require('express-graphql');

const { schema, rootValue } = require('./GraphQLSchema');

const app = express()

app.use('/graphql', graphqlHTTP({
    // pretty: true,
    schema,
    rootValue: rootValue,
    graphiql: true,
}));

console.log('Running a GraphQL API server at localhost:4000/graphql');

module.exports = app
