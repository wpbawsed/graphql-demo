const { UserInputError, AuthenticationError } = require('apollo-server-express')
const bcrypt = require('bcrypt')

const { User } = require('../users')

const tokenUtil = require('../../services/jwt')
const config = require('../../config')

const SALT_ROUNDS = 12

const login = async (_, { email, password }) => {
    const user = await User.findOne({
        email
    })
    if (!user) {
        throw new AuthenticationError('User not found')
    }
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword)
    if (!isPasswordValid) {
        throw new AuthenticationError('Incorrect password')
    }
    const token = tokenUtil.create(user._id)
    return {
        user: {
            ...user._doc,
            id: user._id
        },
        token,
        tokenExpiration: config.JWT_LIFE_TIME
    }
}

const signUp = async (_, {
    email,
    password,
    firstName,
    lastName
}) => {
    try {
        const existingUser = await User.findOne({
            email
        })
        if (existingUser) {
            throw new UserInputError('User already exists')
        }
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
        const user = await User.create({
            email,
            hashedPassword,
            firstName,
            lastName
        })
        return {
            ...user._doc,
            id: user._id,
            hashedPassword: null
        }
    } catch (error) {
        throw error
    }
}

module.exports = {
    login,
    signUp
}