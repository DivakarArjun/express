
const jwt = require('jsonwebtoken');
var crypto = require('crypto');
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator');
var JWTSECRET=process.env.JWTSECRET;
const { User } = require('../models/user.js')
const sendmail=require('../mail/sendmail')
const { authenticator } = require('otplib');
const qrcode =require('qrcode');
const { UserSession } = require('../models/userSession.js');
module.exports={
    loginUser:async (req, res) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
                res.status(401).json({
                    result: 1, msg: err
                });
                return;
            }
            var { email, password } = req.body
            email = email.toLowerCase()
            let finduser=await User.findOne({email:email},{uuid:1,companyName:1,password:1,email:1,isVerified:1,isBank:1,isKey:1,isAuth:1})
            if(!finduser){
                return res.status(201).json({ result: 1, msg: 'Invalid Credential.',err_msg:"Error"});
            }
            let match =await bcrypt.compare(password,finduser.password)
            if(!match){
                return res.status(201).json({ result: 1, msg: 'Invalid Credential.',err_msg:"Error"});
            }
            else if (finduser?.isVerified==false) {
                return res.status(201).json({ result: 1, msg: 'Account Not Verified.',err_msg:"Error"});
            }
            let jwtdata = {
                _id: finduser._id,
                uuid: finduser.uuid,
                companyName: finduser.companyName,
                email: finduser.email,
                tokenType:"basic"
            }
            let token = jwt.sign({ jwtdata, loggedIn: true }, JWTSECRET, { expiresIn: '10d' });
            res.send({ result: 0, msg: 'Login successfully.', data: finduser, token: token});
        }catch (error) {
            res.status(501).json({ result: 1, msg: error,err_msg:"Error"});
        }
    },
    sendmailSupport:async (req, res) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
                res.status(401).json({
                    result: 1, msg: err
                });
                return;
            }
            var { first_name,last_name,email_id, subject,state,description } = req.body
            let msg=`<html>
                    <body>
                    <p><b>First Name : </b> ${first_name}</p>
                    <p><b>Last Name : </b> ${last_name}</p>
                    <p><b>Email : </b> ${email_id}</p>
                    <p><b>State : </b> ${state}</p>
                    <p><b>Description : </b> ${description}</p>
                    </body>
                    </html>`
            sendmail("xyz@gmail.com",subject,msg).then(()=>{
                res.json({ result: 0, msg: 'Success',data:{}});
            }).catch((e)=>{
                res.status(501).json({ result: 1, msg: 'Mail not send.',err_msg:"Error"});
            })
        } catch (error) {
            res.status(501).json({ result: 1, msg: error,err_msg:"Error"});
        }
    },
    forgotPassword:async (req,res)=>{
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
                return res.status(201).json({
                    result: 1, msg: err
                });
            }
            const {email}=req.body
            let finduser=await User.findOne({email:email})
            if(!finduser){
                return res.status(201).json({ result: 1, msg: 'User not exist.',err_msg:"Error"});
            }else if (!finduser?.isVerified) {
                return res.status(201).json({ result: 1, msg: 'Account Not Verified.',err_msg:"Error"});
            }
            let payload={
                _id:finduser._id,
                uuid:finduser.uuid,
                email:finduser.email,
                tokenType:"forgot"
            }
            let token=jwt.sign(payload,JWTSECRET,{expiresIn:process.env.FORGOT_TOKEN_EXPIRE})
            sendmail(email,"Forgot password",process.env.FORGOT_URL+"/"+token).then(()=>{
                res.json({ result: 0, msg: 'Success',data:{}});
            }).catch((e)=>{
                res.status(501).json({ result: 1, msg: 'Mail not send.',err_msg:"Error"});
            })
        } catch (error) {
            res.status(501).json({ result: 1, msg: error,err_msg:"Error"});
        }
    },
    ValidForgotToken:async(req,res)=>{
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
                return res.status(201).json({
                    result: 1, msg: err
                });
            }
            const {token}=req.body
            let checktoken=await jwt.verify(token,JWTSECRET)
            if(!checktoken){
                res.send({ result: 1, msg: 'Invalid Token.',err_msg:"Error"}); 
            }else if(checktoken.jwtdata.tokenType!="forgot"){
                res.send({ result: 1, msg: 'Invalid Token.',err_msg:"Error"}); 
            }
            res.send({ result: 0, msg: 'Token Verify successfully.'});
        } catch (error) {
            res.status(501).json({ result: 1, msg: error,err_msg:"Error"});
        }
    },
    setPassword:async(req,res)=>{
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
                return res.status(201).json({
                    result: 1, msg: err
                });
            }
            let {email,otp,new_password,confirm_password}=req.body
            let finduser=await User.findOne({email:email,isVerified:true})
            if(!finduser){
                return res.status(201).json({ result: 1, msg: 'User not exist.',err_msg:"Error"});
            }else if (!finduser?.isVerified) {
                return res.status(201).json({ result: 1, msg: 'Account Not Verified.',err_msg:"Error"});
            }
            if(authenticator.verify({token:otp.toString(),secret:finduser.authSecret})){
                console.log("ji")
                if(new_password==confirm_password){
                    new_password= await bcrypt.hash(new_password, 12)
                    await User.updateOne({_id:finduser._id},{password:new_password})
                    res.send({ result: 0, msg: 'Change Password successfully.'});
                }
                else{
                    res.status(201).json({ result: 1, msg: 'Password and Confirm Password not match.',err_msg:"Error"});
                }
            }else{
                res.status(201).json({ result: 1, msg: 'Invalid token.',err_msg:"Error"});
            }
        } catch (error) {
            res.status(501).json({ result: 1, msg: error,err_msg:"Error"});
        }
    },
    generate2fa:async(req,res)=>{
        try{
            const {_id}=req.user.newUser
            let finduser=await User.findOne({_id:_id})
            if(!finduser){
                return res.status(401).json({ result: 1, msg: "User Not Found.",err_msg:"Error"});
            }else if (!finduser?.isVerified) {
                return res.status(201).json({ result: 1, msg: 'Account Not Verified.',err_msg:"Error"});
            }
            if(finduser['isAuth']){
                return res.status(201).json({ result: 1, msg: "Already set authentication.",err_msg:"Error"});
            }
            const secret = authenticator.generateSecret();
            const otpauth = authenticator.keyuri("user", "Crypto APP", secret);
            await User.updateOne({_id:_id},{authSecret:secret})
            let jwtdata = {
                _id: finduser._id,
                uuid: finduser.uuid,
                companyName: finduser.companyName,
                email: finduser.email,
                tokenType:"basic"
            }
            let token = jwt.sign({ jwtdata, loggedIn: true }, JWTSECRET, { expiresIn: '10d' });
            qrcode.toDataURL(otpauth, (err, imageUrl) => {
                if (err) {
                    return res.status(201).json({ result: 1, msg: err,err_msg:"Error"});
                }
                res.send({ result: 0, msg: 'Create QR successfully.', data: {url:imageUrl,key:secret,token:token}});
            });
        } catch (error) {
            res.status(501).json({ result: 1, msg: error,err_msg:"Error"});
        }
    },
    verify2fa:async(req,res)=>{
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
                return res.status(201).json({
                    result: 1, msg: err
                });
            }
            const {otp}=req.body
            const {_id}=req.user.jwtdata

            let finduser=await User.findOne({_id:_id})
            if(!finduser){
                return res.status(401).json({ result: 1, msg: "User Not Found.",err_msg:"Error"});
            }else if (!finduser?.isVerified) {
                return res.status(201).json({ result: 1, msg: 'Account Not Verified.',err_msg:"Error"});
            }
            if(authenticator.verify({token:otp.toString(),secret:finduser.authSecret})){
                let session_id=crypto.randomBytes(16).toString('base64')
                await User.updateOne({_id:finduser._id},{isAuth:true})
                await UserSession.create({uuid:session_id})
                let jwtdata = {
                    _id: finduser._id,
                    uuid: finduser.uuid,
                    companyName: finduser.companyName,
                    email: finduser.email,
                    tokenType:"auth",
                    isAuth:true,
                    isVerified:finduser?.isVerified,
                    isBank:finduser?.isBank,
                    isKey:finduser?.isKey,
                    sessionId:session_id
                }
                let token = jwt.sign({ jwtdata, loggedIn: true }, JWTSECRET, { expiresIn: '10d' });
                return res.status(200).json({ result: 0, msg: 'Verify successfully.',data:{user:jwtdata,token:token}});
            }
            res.status(201).json({ result: 1, msg: 'Invalid.',err_msg:"Error"});
        } catch (error) {
            res.status(501).json({ result: 1, msg: error,err_msg:"Error"});
        }
    },
    logout:async(req,res)=>{
        try{
            await UserSession.deleteOne({uuid:req.user.jwtdata.sessionId})
            res.status(201).json({ result: 0, msg: 'Logout successfully.'});
        } catch (error) {
            res.status(501).json({ result: 1, msg: error,err_msg:"Error"});
        }
    }
}