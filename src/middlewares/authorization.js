'use strict'

const User = require('../models/user.model')
const passport = require('passport')
const APIError = require('../utils/APIError')
const httpStatus = require('http-status')
const bluebird = require('bluebird')
const { secret } = require('../config')
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret // replace with your secret key
};

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  // console.log("🚀 ~ passport.use ~ jwt_payload:", jwt_payload)
  // console.log("in my auth function")
  User.findById(jwt_payload.sub, (err, user) => {
    // console.log("🚀 ~ User.findById ~ jwt_payload:", jwt_payload)
    if (err) {
      return done(err, false);
    }
    if (user) {
      // console.log("🚀 ~ User.findById ~ user:", user)
      jwt_payload.user = user
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));

// handleJWT with roles
const handleJWT = (req, res, next, roles) => async (err, user, info) => {
  // console.log("🚀 ~ handleJWT ~ req:",user)
  // console.log('in auth 1')

  const error = err || info
  const logIn = bluebird.promisify(req.logIn)
  const apiError = new APIError(
    error ? error.message : 'Unauthorized',
    httpStatus.UNAUTHORIZED
  )

  // log user in
  // console.log('in auth 2')
  try {
    if (error || !user) throw error
    await logIn(user, { session: false })
  } catch (e) {
    return next(apiError)
  }

  // see if user is authorized to do the action
  if (!roles.includes(user.role)) {
    return next(new APIError('Forbidden', httpStatus.FORBIDDEN))
  }

  req.user = user

  return next()
}
   

// exports the middleware
const authorize = (roles = User.roles) => (req, res, next) => {
console.log("🚀 ~ authorize ~ roles:", roles)
// console.log("in auth 0",req.body)
  passport.authenticate(
    'jwt',
    { session: false },
    handleJWT(req, res, next, roles)
    )(req, res, next)

  
  }

  // const myAuthentication = (re)
    
module.exports = authorize
