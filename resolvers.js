const model = require('./model/model');

// Provide resolver functions for your schema fields
module.exports.resolvers = {
    Query: {
        hello: (root, args, context) => {
            console.log(root)
            console.log(args)
            console.log(context)
            return 'Hello world!';
        },
        me: (root, args, { userId, model }) => {
            return model.findUserById(userId);
        },
        users: (root, args, { model }) => model.getUsers(),
        user: (root, { name }, { model }) => {
            return model.findUserByName(name);
        },
    },
    User: {
        friends: (parent, args, { model }) => {
            return parent.friendIds.map(id => model.findUserById(id));
        },
        posts: (parent, args, { model }) => {
            return model.filterPostsByAuthorId(parent.id);
        },
        height: (parent, args) => {
            const { unit } = args;
            if (!unit || unit === 'CENTIMETRE') return parent.height;
            else if (unit === 'METRE') return parent.height / 100;
            else if (unit === 'FOOT') return parent.height / 30.48;
            throw new Error(`Height unit "${unit}" not supported.`);
        },
        weight: (parent, args, context) => {
            const { unit } = args;
            if (!unit || unit === 'KILOGRAM') return parent.weight;
            else if (unit === 'GRAM') return parent.weight * 100;
            else if (unit === 'POUND') return parent.weight / 0.45359237;
            throw new Error(`Weight unit "${unit}" not supported.`);
        },
    },
    Post: {
        likeGivers: (parent, args, context) => {
            return parent.likeGiverIds.map(id => model.findUserById(id));
        },
        author: (parent, args, context) => {
            return model.findUserById(parent.authorId);
        },
    }
};
