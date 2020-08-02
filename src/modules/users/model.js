const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    changed: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date
    }
})

userSchema.methods = {
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

const User = mongoose.model('User', userSchema)

module.exports = {
    schema: User.schema,
    User: User
}