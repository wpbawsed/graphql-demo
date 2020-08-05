const { gql } = require('apollo-server-express')

// 引入外部套件
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 定義 bcrypt 加密所需 saltRounds 次數
const SALT_ROUNDS = 2;
// 定義 jwt 所需 secret (可隨便打)
const SECRET = 'just_a_random_secret';

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
        "識別碼"
        id: ID!
        
        "帳號 email"
        email: String!
        
        "名字"
        name: String
        
        "年齡"
        age: Int
          
        "朋友"
        friends: [User]
        
        "貼文"
        posts: [Post]
    }

    type Post {
        id: ID!
        author: User!
        title: String!
        content: String!
        likeGivers: [User]
        createdAt: String
    }

    type Query {
        hello: String
        me: User
        users: [User!]!
        
        "取得特定 user (name 為必填)"
        user(name: String!): User
        
        posts: [Post!]!
        "依照 id 取得特定貼文"
        post(id: ID!): Post
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
        
        signUp(name: String, email: String!, password: String!): User
    }
`);

// ---- Data
let userList = [
    {
        id: 1,
        email: 'fong@test.com',
        password: '$2b$04$wcwaquqi5ea1Ho0aKwkZ0e51/RUkg6SGxaumo8fxzILDmcrv4OBIO', // 123456
        name: 'Fong',
        age: 23,
        friendIds: [2, 3]
    },
    {
        id: 2,
        email: 'kevin@test.com',
        passwrod: '$2b$04$uy73IdY9HVZrIENuLwZ3k./0azDvlChLyY1ht/73N4YfEZntgChbe', // 123456
        name: 'Kevin',
        age: 40,
        friendIds: [1]
    },
    {
        id: 3,
        email: 'mary@test.com',
        password: '$2b$04$UmERaT7uP4hRqmlheiRHbOwGEhskNw05GHYucU73JRf8LgWaqWpTy', // 123456
        name: 'Mary',
        age: 18,
        friendIds: [1]
    }
]

let postList = [
    {
        id: 1,
        authorId: 1,
        title: 'Hello World',
        body: 'This is my first post',
        likeGiverIds: [1, 2],
        createdAt: '2018-10-22T01:40:14.941Z'
    },
    {
        id: 2,
        authorId: 2,
        title: 'Nice Day',
        body: 'Hello My Friend!',
        likeGiverIds: [1],
        createdAt: '2018-10-24T01:40:14.941Z'
    }
]

// ---- GraphQL Schema
const queries = {
    hello: () => 'Hello world!',

    me: () => {
        let userId = 1

        let model = new GraphQLUser()

        return model.getUser(userId)
    },

    users: () => {
        let model = new GraphQLUser()

        return model.getUsers()
    },

    // 對應到 Schema 的 Query.user
    user: (root, args, context) => {
        console.log(root, args, context)

        const { name } = args;

        let model = new GraphQLUser()

        return model.getUserByName(name)
    },

    posts: () => {
        let model = new GraphQLPost()

        return model.getUsers()
    },
};

const mutations = {
    addUser: ({ name, height, weight }) => {
        let model = new GraphQLUser()

        const newUser = {
            id: model.getUsers().length + 1,
            name,
            height,
            weight
        }

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

    signUp: async (root, { name, email, password }, context) => {
        let model = new GraphQLUser()

        // 1. 檢查不能有重複註冊 email
        const isUserEmailDuplicate = model.getUsers().some(user => user.email === email);

        if (isUserEmailDuplicate) throw new Error('User Email Duplicate');

        // 2. 將 passwrod 加密再存進去。非常重要 !!
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 3. 建立新 user
        return model.createUser({ name, email, password: hashedPassword });
    },
}

const userResolver = {
    // 對應到 Schema 的 User.height
    // height: (parent, args) => {
    //     console.log(parent, args)
    //     const { unit } = args;
    //     // 可注意到 Enum type 進到 javascript 就變成了 String 格式
    //     // 另外支援 default 值 CENTIMETRE
    //     if (!unit || unit === "CENTIMETRE") return parent.height;
    //     else if (unit === "METRE") return parent.height / 100;
    //     else if (unit === "FOOT") return parent.height / 30.48;
    //     throw new Error(`Height unit "${unit}" not supported.`);
    // },
    // // 對應到 Schema 的 User.weight
    // weight: (parent, args, context) => {
    //     const { unit } = args;
    //     // 支援 default 值 KILOGRAM
    //     if (!unit || unit === "KILOGRAM") return parent.weight;
    //     else if (unit === "GRAM") return parent.weight * 100;
    //     else if (unit === "POUND") return parent.weight / 0.45359237;
    //     throw new Error(`Weight unit "${unit}" not supported.`);
    // },
    posts: (parent, args, context) => {
        const { id } = parent

        let model = new GraphQLPost()

        let posts = model.getPosts()

        return posts.filter(post => post.authorId === id)
    },
    friends: (parent, args, context) => {
        const { friendIds } = parent

        let model = new GraphQLUser()

        let users = model.getUsers()

        return users.filter(user => friendIds.includes(user.id))
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

    getUserByName (name) {
        return userList.find(user => user.name === name)
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
