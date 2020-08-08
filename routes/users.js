
   
const express  = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const {ensureAuthenticated } = require('../config/auth');
const passport = require('passport');
const jwt = require('jsonwebtoken');
                                                                                        



// USER MODEl
const User = require("../models/user");

//REGISTER  POST

router.post('/register', (req, res) => {
    const { firstname, lastname, email, password, phone } = req.body;
    console.log( req.body);
    console.log(lastname);
    User.findOne({email: email})
        .then(user => {
            if(user){
                console.log("user already registered");
                res.json({isError: true, message: "El Email ya esta usado."});
            }else{
                const newUser = new User({
                    firstname,
                    lastname,
                    email,
                    password,
                    phone

                });

                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt, (err, hash) =>{
                        if(err){
                            console.log(err);
                        }
                        newUser.password = hash;

                        newUser.save()
                            .then(user => {
                                res.json({isError: false, message: "Se registro exitosamente al usuario."});
                                console.log("user added")
                            })
                            .catch(err => console.log(err));

                     }));
            }
        });

});

router.post('/login', (req, res, next) => {
    passport.authenticate('local-user-signup',
    (err, user, info) => {
      if (err) {
        return next(err);
      }
  
      if (!user) {
        return  res.json({isError: true, message: "Usuario no encontrado"});
      }

  
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        // User Found

        const userTokenObject = {
                    id: user._id,
                    email: user.email
                }
       const accessToken = jwt.sign(userTokenObject, process.env.ACCESS_TOKEN_SECRET);
       res.json({accessToken: accessToken});

      });
  
    })(req, res, next);
  });



router.get('/logout', (req, res) => {
    req.logout();
    res.send("LogOut");
});


module.exports = router;