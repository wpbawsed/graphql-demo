const mongoose = require('mongoose')

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
})

todoSchema.methods = {
    view (full) {
        let view = {}

        let fields = ['id', 'title', 'description', 'isCompleted']

        fields.forEach((field) => { view[field] = this[field] })

        return view
    },
}

const Todo = mongoose.model('Todo', todoSchema)

module.exports = {
    schema: Todo.schema,
    Todo: Todo
}