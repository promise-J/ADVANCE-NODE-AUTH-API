const express = require('express')
const { Register,
     Login,
      ResetPassword,
       Forgotpassword
     } = require('../controllers/auth')
const router = express.Router()

router.route('/register').post(Register)
router.route('/login').post(Login)
router.route('/forgotpassword').post(Forgotpassword)
router.route('/resetpassword/:resetToken').put(ResetPassword)

module.exports = router