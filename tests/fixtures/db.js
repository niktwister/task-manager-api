const {randomUUID} = require('crypto')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneSessionId = randomUUID()
const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: "Naruto Uzumaki",
    email: "rasengan@konohamail.com",
    password: "iloveramen",
    activeSessions: [userOneSessionId]
}
const userOneToken = jwt.sign({
    userId: userOneId, 
    sessionId: userOneSessionId
    }, 
    process.env.JWT_SECRET_KEY
)


const userTwoSessionId = randomUUID()
const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: "Sasuke Uchiha",
    email: "sharingan@konohamail.com",
    password: "ilovenaruto",
    activeSessions: [userTwoSessionId]
}
const userTwoToken = jwt.sign({
    userId: userTwoId, 
    sessionId: userTwoSessionId
    }, 
    process.env.JWT_SECRET_KEY
)


const userOneTaskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'to visit ichiraku ramen',
    completed: true,
    owner: userOneId
}

const userOneTaskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'to save Sasuke',
    completed: false,
    owner: userOneId
}

const userTwoTaskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'to take revenge',
    completed: false,
    owner: userTwoId
}

const setupDatabase = async () => {

    await User.deleteMany({}).exec()

    await Task.deleteMany({}).exec()

    await new User(userOne).save()

    await new User(userTwo).save()

    await new Task(userOneTaskOne).save()

    await new Task(userOneTaskTwo).save()

    await new Task(userTwoTaskOne).save()
}

module.exports = {
    userOneSessionId,
    userOneId,
    userOne,
    userOneToken,
    userTwoSessionId,
    userTwoId,
    userTwo,
    userTwoToken,
    userOneTaskOne,
    userOneTaskTwo,
    userTwoTaskOne,
    setupDatabase
}


