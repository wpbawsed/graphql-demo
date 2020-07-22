var express = require('express');
var graphqlHTTP = require('express-graphql');

// const { schema } = require('./schema');
// const { resolvers } = require('./resolvers');

const { schema, rootValue } = require('./GraphQLSchema');

var app = express();

app.use('/graphql', graphqlHTTP({
    // pretty: true,
    schema,
    rootValue: rootValue,
    graphiql: true,
}));

app.listen(4000);

console.log('Running a GraphQL API server at localhost:4000/graphql');
