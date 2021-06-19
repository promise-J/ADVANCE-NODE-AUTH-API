const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 
            'Please provide a valid Email'
        ]
    },
        password: {
            type: String,
            required: [true, 'Please enter a password'], 
            minLength: 5,
            select: false
        },
        resetPasswordToken: String,
        resetPasswordExpire: String
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next()
    }

     const salt = await bcrypt.genSalt(10)
     this.password = await bcrypt.hash(this.password, salt)
     next()
})

userSchema.methods.passwordMatch = async function(password){
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.genToken = function(){
    const token = jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: '1h'})
    return token
}

const User = mongoose.model('User', userSchema)

module.exports = User