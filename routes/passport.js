const passport = require('passport');
const { UserSession } = require('../models/userSession');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const SECRET = process.env.JWTSECRET;
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken('JWT');
opts.secretOrKey = SECRET;
passport.use('2faAuth',new JwtStrategy(opts, function(jwt_payload, done) {
    if(jwt_payload['jwtdata']){
        jwt_payload['newUser']= jwt_payload?.jwtdata
    }
    if (jwt_payload && jwt_payload?.newUser && jwt_payload?.newUser?.email ) {
        return done(null, jwt_payload);
    } else {
        return done(null, false);
    }
}));
passport.use('auth',new JwtStrategy(opts, async function(jwt_payload, done) {
    if (jwt_payload && jwt_payload.jwtdata && jwt_payload.jwtdata.email && jwt_payload.jwtdata.isAuth && jwt_payload.jwtdata.tokenType=="auth" ) {
        let findsession=await UserSession.findOne({uuid:jwt_payload.jwtdata.sessionId})
        if(!findsession){
            return done(null, false);
        }
        return done(null, jwt_payload);
    } else {
        return done(null, false);
    }
}));
passport.use('basicAuth',new JwtStrategy(opts, function(jwt_payload, done) {
    console.log(jwt_payload)
    if (jwt_payload && jwt_payload.jwtdata && jwt_payload.jwtdata.email && jwt_payload.jwtdata.tokenType=="basic" ) {
        return done(null, jwt_payload);
    } else {
        return done(null, false);
    }
}));
module.exports = passport;