const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.isAuthenticated = async (req, res, next) => {
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token){
        res.status(401).json({
            success: false,
            error: 'Token must be present'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = User.findById(decoded.id)
        if(!user){
            res.status(401).json({
                success: false,
                error: 'No user with this ID'
            })
        }

        req.user = user

        next()

    } catch (error) {
        res.send(error.message)
    }
    
}