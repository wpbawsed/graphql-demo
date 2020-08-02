const { ApolloError } = require('apollo-server-express')

const { books } = require('./data')

const { Book } = require('.')

const getBooks = async (_) => {
    return books
    // return Book.find({
    // });
}

const getBook = async (_, args) => {
    const { id } = args
    const book = await Book
        .findById(id)
        .populate('createdBy')

    if (!book) {
        throw new ApolloError('Not found')
    }

    return book
}

module.exports = {
    getBooks,
    getBook
}