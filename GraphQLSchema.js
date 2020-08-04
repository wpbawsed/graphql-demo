const { gql } = require('apollo-server-express')

exports.typeDefs = gql(`
    """
    高度單位
    """
    enum HeightUnit {
        "公尺"
        METRE
        "公分"
        CENTIMETRE
        "英尺 (1 英尺 = 30.48 公分)"
        FOOT
    }

    """
    重量單位
    """
    enum WeightUnit {
        "公斤"
        KILOGRAM
        "公克"
        GRAM
        "磅 (1 磅 = 0.45359237 公斤)"
        POUND
    }

    type User {
        id: ID!
        name: String!
        
        "身高 (預設為 CENTIMETRE)"
        height(unit: HeightUnit = CENTIMETRE): Float
        
        "體重 (預設為 KILOGRAM)"
        weight(unit: WeightUnit = KILOGRAM): Float
    }

    type Post {
        id: ID!
        author: User!
        title: String!
        content: String!
        likeGivers: [User]
    }

    type Query {
        hello: String
        
        users: [User!]!
        posts: [Post!]!
        
        user(id: ID!): User
        
        "取得特定 user (name 為必填)"
        userByName(name: String!): User
    }
  
    type RemoveUserPayload {
        deletedUserId: Int!
    }
    
    input AddPostInput {
      title: String!
      content: String
    }
    
    type Mutation {
        addUser(name: String!): User
        renameUser(id: Int!, name: String!): User
        removeUser(id: Int!): RemoveUserPayload
        
        "新增貼文"
        addPost(input: AddPostInput!): Post
        
        "貼文按讚 (收回讚)"
        likePost(postId: ID!): Post
    }
`);

// ---- Data
let userList = [
    {
        id: "1",
        name: 'aaaaa',
        height: 190,
        weight: 95
    },
    {
        id: "2",
        name: 'bbbbb',
        height: 180,
        weight: 100
    },
    {
        id: "3",
        name: 'ccccc',
        height: 178,
        weight: 79
    },
    {
        id: "4",
        name: 'ddddd',
        height: 165,
        weight: 65
    },
]

let postList = [
    { id: "1", authorId: "1", title: "Hello World!", content: "This is my first post.", likeGivers: ["2"] },
    { id: "2", authorId: "2", title: "Good Night", content: "Have a Nice Dream =)", likeGivers: ["2", "3"] },
    { id: "3", authorId: "1", title: "I Love U", content: "Here's my second post!", likeGivers: [] },
]

// ---- GraphQL Schema
const queries = {
    hello: () => 'Hello world!',

    users: () => {
        let model = new GraphQLUser()

        return model.getUsers()
    },

    // 對應到 Schema 的 Query.user
    user: (root, args, context) => {
        console.log(root, args, context)

        const { id } = args;

        let model = new GraphQLUser()

        return model.getUser(id)
    },

    posts: () => {
        let model = new GraphQLPost()

        return model.getUsers()
    },
};

const mutations = {
    addUser: ({ id, name, height, weight }) => {
        const newUser = { id, name, height, weight }

        let model = new GraphQLUser()

        return model.createUser(newUser)
    },
    renameUser: ({ id, name, height, weight }) => {
        const editUser = { id, name, height, weight }

        let model = new GraphQLUser()

        return model.updateUser(id, editUser)
    },

    removeUser: ({ id }) => {
        let model = new GraphQLUser()

        return model.deleteUser(id)
    },

    addPost: (root, args, context) => {
        // const { title, content } = args;

        const { input } = args;
        const { title, content } = input;

        let userId = "1"

        let model = new GraphQLPost()

        let data = {
            id: model.getPosts().length + 1,
            authorId: userId,
            title,
            content,
            likeGivers: []
        }

        let posts = model.createPost(data)

        return data;
    },
    likePost: (root, args, context) => {
        const { postId } = args;

        let userId = "1"

        let model = new GraphQLPost()

        const post = model.getPost(postId)

        if (!post) throw new Error(`Post ${postId} Not Exists`);

        if (post.likeGivers.includes(userId)) {
            // 如果已經按過讚就收回
            const index = post.likeGiverIds.findIndex(v => v === userId);
            post.likeGivers.splice(index, 1);
        } else {
            // 否則就加入 likeGiverIds 名單
            post.likeGiverIds.push(userId);
        }
        return post;
    },
}

const userResolver = {
    // 對應到 Schema 的 User.height
    height: (parent, args) => {
        console.log(parent, args)
        const { unit } = args;
        // 可注意到 Enum type 進到 javascript 就變成了 String 格式
        // 另外支援 default 值 CENTIMETRE
        if (!unit || unit === "CENTIMETRE") return parent.height;
        else if (unit === "METRE") return parent.height / 100;
        else if (unit === "FOOT") return parent.height / 30.48;
        throw new Error(`Height unit "${unit}" not supported.`);
    },
    // 對應到 Schema 的 User.weight
    weight: (parent, args, context) => {
        const { unit } = args;
        // 支援 default 值 KILOGRAM
        if (!unit || unit === "KILOGRAM") return parent.weight;
        else if (unit === "GRAM") return parent.weight * 100;
        else if (unit === "POUND") return parent.weight / 0.45359237;
        throw new Error(`Weight unit "${unit}" not supported.`);
    }
}

const postResolver = {
    // 2-1. parent 為 post 的資料，透過 post.likeGiverIds 連接到 users
    likeGivers: (parent, args, context) => {
        return parent.likeGiverIds.map(id => {
            let userModel = new GraphQLUser()
            return userModel.getUser(id)
        });
    },
    // 2-2. parent 為 post 的資料，透過 post.author
    author: (parent, args, context) => {
        let userModel = new GraphQLUser()
        return userModel.getUser(parent.authorId)
    }
}

// ----- model
class GraphQLUser {
    createUser(user) {
        return userList.push(user)
    }

    updateUser(id, data) {
        let updateIndex = userList.findIndex(user => user.id === id)
        userList[updateIndex] = data
        return userList
    }

    getUser(id) {
        return userList.find(user => user.id === id)
    }

    getUsers() {
        return userList
    }

    deleteUser(id) {
        let deleteIndex = userList.findIndex(user => user.id === id)
        return userList.splice(deleteIndex, 1)
    }
}

class GraphQLPost {
    createPost(post) {
        return postList.push(post)
    }

    updatePost(id, data) {
        let updateIndex = postList.findIndex(post => post.id === id)
        postList[updateIndex] = data
        return postList
    }

    getPost(id) {
        return postList.find(post => post.id === id)
    }

    getPosts() {
        return postList
    }

    deletePost(id) {
        let deleteIndex = postList.findIndex(post => post.id === id)
        return postList.splice(deleteIndex, 1)
    }
}

exports.resolvers = {
    Query: queries,
    User: userResolver,
    Post: postResolver,
    Mutation: mutations,
};
