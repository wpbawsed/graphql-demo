const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    changed: {
        type: Date,
        default: Date.now
    }
})

bookSchema.methods = {
    view (full) {
        let view = {}
        let fields = ['id', 'name', 'picture']

        if (full) {
            fields = [...fields, 'email', 'createdAt']
        }

        fields.forEach((field) => { view[field] = this[field] })

        return view
    },
}

const Book = mongoose.model('Book', bookSchema)

module.exports = {
    schema: Book.schema,
    User: Book
}