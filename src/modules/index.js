const { makeExecutableSchemaFromModules } = require('../utils/modules')

const { auth } = require('./auth')
const { books } = require('./books')
const { users } = require('./users')
const { todos } = require('./todo')

module.exports = makeExecutableSchemaFromModules({
    modules: [
        auth,
        users,
        books,
        todos
    ]
})
