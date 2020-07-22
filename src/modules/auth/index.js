const { data } = require("./data");
const { Book } = require("./model");
const { resolvers } = require("./resolvers");
const { typeDef } = require("./typeDef");

module.exports = {
    data,
    Book,
    resolvers,
    typeDef,
};
