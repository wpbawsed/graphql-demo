const { Todo } = require('.')

const createTodo = async (_, args, { user }) => {
    const {title, description} = args

    const userId = user._id.toString()

    const newTodo = new Todo({
        title,
        description,
    })

    return await newTodo.save()
}

module.exports = {
    createTodo
}