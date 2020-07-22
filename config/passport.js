
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').JwtStrategy;
const utils = require('./utils');

// Load User model
const User = require('../models/user');
const Admin = require('../models/admin');

function SessionConstructor(userId, userGroup, details) {
    this.userId = userId;
    this.userGroup = userGroup;
    this.details = details;
  }

  const options = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "Secret Ket eCookies",
      algorithms: ['RS256']
  }

module.exports = function(passport){
    passport.use('local-user-signup', new LocalStrategy({ 
            usernameField: 'email'}, (email, password, done) => {
            User.findOne({email: email})
            .then(user => {
                if(!user){
                    return done(null, false, {message: 'That email is not registered'});
                }
                
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if(isMatch){
                        return done(null, user);
                    }
                });


            })
            .catch(err => console.log(err));
        })
    );

    passport.use('local-admin-signup', new LocalStrategy({ 
        usernameField: 'email'}, (email, password, done) => {
        Admin.findOne({email: email})
        .then(user => {
            if(!user){
                return done(null, false, {message: 'That email is not registered'});
            }
            
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if(isMatch){
                    return done(null, user);
                }
            });


        })
        .catch(err => console.log(err));
        })
    );
    
    passport.use('jwt-token', new JwtStrategy(options, function(jwt_payload, done){

        User.findOne({_id: jwt_payload.sub}, function(err, user){

            if(err){
                return done(err, false);
            }
            if(user){
                return done(null, user);
            }else{
                return done(null, false);
            }

        });

    }));








    passport.serializeUser((userObject, done) => {

        let userGroup = "admin";
        let userPrototype = Object.getPrototypeOf(userObject);

        if(userPrototype === Admin.prototype){
            userGroup = "admin";
        }else if (userPrototype === User.prototype){
            userGroup = "user";
        }

        let sessionConstructor = new SessionConstructor(userObject.id, userGroup, '');
        done(null, sessionConstructor);
    });

    passport.deserializeUser((sessionConstructor, done) => {

        if(sessionConstructor.userGroup == "admin"){

            Admin.findOne({
                _id: sessionConstructor.userId
            }, '-localStrategy.password', (err, user) => {
                done(err, user);

            });
        }else if (sessionConstructor.userGroup == "user"){

            User.findOne({
                _id: sessionConstructor.userId
            }, '-localStrategy.password', (err, user) => {
                done(err, user);

            });

        }
    });
}