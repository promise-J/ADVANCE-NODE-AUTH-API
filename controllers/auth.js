const SendmailTransport = require('nodemailer/lib/sendmail-transport')
const User = require('../models/User')
const sendMail = require('../utils/sendEmail')

exports.Register = async (req, res, next)=> {
  const {username, email, password} = req.body
  const existingUser = await User.findOne({username})
  const existEmail = await User.findOne({email})

  if(existingUser) return res.status(400).json({
    success: false,
    error: 'User already exists...'
  })

  if(existEmail) return res.status(400).json({
    success: false,
    error: 'Email already exists...'
  })

  try {
    const user = await User.create({
      username, email, password
    })

    res.status(201).json({
      success: true,
      message: `${user.username} is now registered`
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
    console.log(error)
  }
}

exports.Login = async (req, res, next)=> {
  const {email, password} = req.body
  if(!email || !password){
    res.status(401).json({
      success: false,
      error: 'Please fill in email and password'
    })
  }

  try {
    const user = await User.findOne({email}).select('+password')
  
  if(!user){
    res.status(401).json({
      success: false,
      error: 'Wrong Credentials'
    })
  }
  
  const isMatch = await user.passwordMatch(password)

  if(!isMatch){
    res.status(401).json({
      success: false,
      error: 'Wrong Credentials'
    })
  }

  // sendMail(options)
  sendToken(user, 201, res)


  } catch (error) {
    
  }
  
  
}

exports.Forgotpassword = async (req, res, next)=> {
  const {email} = req.body
  
  const user = await User.findOne({email}).select("+password")

  if(!user){
    res.status(401).json({
      success: false,
      error: 'Wrong Credentials'
    })
  }

  const token = user.genToken()
  const link = `http://localhost:3000/api/resetpassword/${token}`

  // res.send(link)
  const message = `
    <h1>You have requested for a Password Reset</h1>
    <p>Please click on the link below or copy and paste it on your browser to continue</p>
    <a href=${link} clicktracking=off >${link}</a>
  `

  try {
    
    sendMail({
      to: user.email,
      message: message,
      subject: 'Password Reset'
    })

    user.resetPasswordToken = token
    user.resetPasswordExpire = Date.now() + 3 * (60 * 1000)
    await user.save()
    res.status(201).json({
      success: true,
      message: 'Email sent...',
      user
    })

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Email not existing or wrong Email provided"
    })
  }



}

exports.ResetPassword = async (req, res, next)=> {
  const {resetToken} = req.params
  const {password} = req.body
  try {
    const user = await User.findOne({resetPasswordToken: resetToken, resetPasswordExpire: {
      $gt: Date.now()
    }})
  
  
    if(!user){
      res.status(401).json({
        success: false,
        message: 'Token must have expired.'
      })
    }
  
    user.password = password
    user.resetPasswordExpire = undefined
    user.resetPasswordToken = undefined
    await user.save()
  
    res.send(user)
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    })
  }
  
}

const sendToken = (user, statusCode, res)=>{
  const token = user.genToken()
  res.json({
    success: true,
    token
  })
}