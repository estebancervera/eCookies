const express  = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const {ensureAuthenticated } = require('../config/auth')
const passport = require('passport');

// ADMIN MODEL
const Admin = require("../models/admin");


router.get("/register", function(req, res){
	res.render("register");
});


router.post("/register",  function(req,res){
	const { email, password } = req.body;

    Admin.findOne({email: email})
        .then(user => {
            if(user){
                res.send("email already registered")
            }else{
                const newAdmin = new Admin({
                    
                    email,
                    password
                
                });

                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newAdmin.password, salt, (err, hash) =>{
                        if(err) throw err;
                        newAdmin.password = hash;

                        newAdmin.save()
                            .then(user => {
                                res.redirect("/admin/login")
                            })
                            .catch(err => console.log(err));

                     }));
            }
        });
});
    

router.get("/login", function(req, res){

	res.render("login");
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local-admin-signup', {
        successRedirect: "/dashboard", 
        failureRedirect: "/admin/login"
    })(req, res, next);
});



router.get("/logout", ensureAuthenticated, function(req , res){
	req.logout();
	res.redirect("/admin/login");
});

module.exports = router;