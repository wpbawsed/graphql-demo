const { gql } = require('apollo-server-express')

exports.typeDefs = gql(`
  type User {
    id: ID!
    name: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    author: User!
    title: String!
    body: String!
  }

  type Query {
    hello: String
    users: [User!]!
    posts: [Post!]!
    user(id: ID!): User
  }
  
  type RemoveUserPayload {
    deletedUserId: Int!
  }

  type Mutation {
    addUser(name: String!): User
    renameUser(id: Int!, name: String!): User
    removeUser(id: Int!): RemoveUserPayload
  }
`);

let nextId = 2

const usersById = {
    1: {
        id: 1,
        name: 'chentsuli123n',
    },
};

const postsById = {
    18: {
        id: 18,
        authorId: 1,
        title: 'Day 18：GraphQL 入門 Part I - 從 REST 到 GraphQL',
        body: 'Facebook 在 2012 年開始在公司內部使用 GraphQL，而在 2015 年 7 月開源...',
    },
    19: {
        id: 19,
        authorId: 1,
        title: 'Day 19：GraphQL 入門 Part II - 實作 Schema & Type',
        body: '前一篇講了 REST 的一些缺點，還有 GraphQL 如何解決這些問題...',
    },
};

const queries = {
    hello: () => 'Hello world!',
    users: () => Object.keys(usersById).map(
        id => new GraphQLUser(usersById[id])
    ),
    user: ({ id }) => usersById[id] ? new GraphQLUser(usersById[id]) : null,
    posts: () => Object.keys(postsById).map(
        id => new GraphQLPost(postsById[id])
    ),
};

const mutations = {
    addUser: ({ name }) => {
        const newUser = {
            id: nextId,
            name,
        };
        usersById[nextId] = newUser;

        nextId++;

        return new GraphQLUser(newUser);
    },
    renameUser: ({ id, name }) => {
        usersById[id].name = name;

        return new GraphQLUser(usersById[id]);
    },
    removeUser: ({ id }) => {
        delete usersById[id];

        return {
            deletedUserId: id,
        };
    },
}

class GraphQLUser {
    constructor({ id, name }) {
        this.id = id;
        this.name = name;
    }

    posts() {
        return Object.keys(postsById)
            .map(id => new GraphQLPost(postsById[id]))
            .filter(post => post.authorId === this.id);
    }
}

class GraphQLPost {
    constructor({ id, authorId, title, body }) {
        this.id = id;
        this.authorId = authorId;
        this.title = title;
        this.body = body;
    }

    author() {
        return new GraphQLUser(usersById[this.authorId]);
    }
}

exports.resolvers = {
    Query: queries,
    Mutation: mutations,
};
