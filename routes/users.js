const express  = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const {ensureAuthenticated } = require('../config/auth')
const passport = require('passport');



// USER MODEl
const User = require("../models/user");

//REGISTER  POST

router.post('/register', (req, res) => {
    const { firstname, lastname, email, password, phone } = req.body;

    User.findOne({email: email})
        .then(user => {
            if(user){
                res.send("email already registered")
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
                        if(err) throw err;
                        newUser.password = hash;

                        newUser.save()
                            .then(user => {
                                res.send("User added succesfully");
                            })
                            .catch(err => console.log(err));

                     }));
            }
        });

});

router.post('/login', (req, res,) => {
    passport.authenticate('local-user-signup', {
        successMessage: 'Succesful',
        failureMessage: 'Failure'
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    res.send("LogOut");
});


module.exports = router;