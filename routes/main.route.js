
var express = require('express');
var passport = require('passport');
var router = express.Router();
const { check } = require('express-validator');
const { loginUser, sendmailSupport, forgotPassword, ValidForgotToken, generate2fa, verify2fa, setPassword, logout } = require('../controller/index.controller.js');
/**
* The welcome route
*
* @author  Arjun
* @version 1.0
* @since   2022-04-08 
*/
router.get('/',(req, res) => {
    res.send('welcome')
})
/**
* login routes
*
* @author  Arjun
* @version 1.0
* @since   2022-04-08 
*/
router.post('/login', [
    check('email').exists(),
    check('password').exists()
], loginUser)

/**
* The generate 2fa route
*
* @author  Arjun
* @version 1.0
* @since   2022-04-22 
*/
router.get('/generate2fa',passport.authenticate('2faAuth',{session:false}),generate2fa)

/**
* The verify 2fa route
*
* @author  Arjun
* @version 1.0
* @since   2022-04-22 
*/
router.post('/verify2fa',[
    passport.authenticate('basicAuth',{session:false}),
    check('otp').exists().isLength(6),
],verify2fa)
/**
* send mail routes
*
* @author  Arjun
* @version 1.0
* @since   2022-04-08 
*/
router.post('/sendmail', [
    check('first_name').exists(),
    check('last_name').exists(),
    check('email_id').exists(),
    check('subject').exists(),
    check('state').exists(),
    check('description').exists()
], sendmailSupport)

/**
* forgot password of user
*
* @author  Arjun
* @version 1.0
* @since   2022-04-08 
*/
router.post('/forgotPassword', [
    check('email').exists()
],forgotPassword)
/**
* check password valid
*
* @author  Arjun
* @version 1.0
* @since   2022-04-08 
*/
router.post('/checkTokenExist', [
    check('token').exists()
], ValidForgotToken)
/**
* set password of user
*
* @author  Arjun
* @version 1.0
* @since   2022-04-08 
*/
router.post('/setPassword', [
    check('email').exists(),
    check('otp').exists(),
    check('new_password').exists(),
    check('confirm_password').exists()
], setPassword)

/**
*  user logout
*
* @author  Arjun
* @version 1.0
* @since   2022-05-08 
*/
router.get('/logout',passport.authenticate('auth',{session:false}), logout)
module.exports = router;