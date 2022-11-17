const {randomUUID} = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(email){
            if(!validator.isEmail(email))
                throw new Error('email not valid')
        }
    } ,

    age: {
        type: Number,
        default: 0,
        validate(age){
            if(age < 0)
                throw new Error('age should not be negative')
        }
    } ,

    password: {
        type: String,
        required: true,
        minLength: [7,'password\'s length should not be <= 6 '],
        trim: true,
        validate(pass){
            if(pass.toLowerCase().includes('password'))
                throw new Error('password should not contain \'password\'')
        }
    } ,

    activeSessions: [String],

    avatar: Buffer

},{
    timestamps: true
})


userSchema.statics.findByCredentials = async (email, password) => {

    let user = await User.findOne({email}).exec()

    if(!user)
        throw new Error('invalid email or password.')

    let isCorrectPass = await bcrypt.compare(password, user.password)

    if(isCorrectPass)
        return user
    else
        throw new Error('invalid email or password.')

}


userSchema.methods.generateAuthToken = async function() {

    const user = this

    let userId = user._id
    let sessionId = randomUUID()

    let token = jwt.sign({userId, sessionId}, process.env.JWT_SECRET_KEY)

    user.activeSessions.push(sessionId)

    await user.save()

    return token
}


userSchema.methods.toJSON = function() {

    //  user.toObject() Converts the document instance into a plain-old JavaScript object (POJO).
    //  returned object will not be an instance of mongoose.Document class.
    let userobj = this.toObject()

    delete userobj.password
    delete userobj.activeSessions
    delete userobj.avatar
    
    return userobj
}


userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})


userSchema.pre('save', async function(){

    let user = this

    if(user.isModified('password')){
        let hashedPassword = await bcrypt.hash(user.password,8)

        user.password = hashedPassword
    }
})


userSchema.post('remove', async function(){

    let user = this

    await Task.deleteMany({ owner: user._id }).exec()

})


const User = mongoose.model('User', userSchema)

module.exports = User