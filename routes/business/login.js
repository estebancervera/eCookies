const express  = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const {ensureAuthenticated } = require('../../config/auth')
const passport = require('passport');

// ADMIN MODEL
const Manager = require("../../models/manager");


  

router.get("/login", function(req, res){

	res.render("business/login");
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local-manager-signup', (err, user, next) => {
    if(err){
        req.flash("error_msg", `${err}`);
        return res.redirect('/business/login')
    }
    if(!user){
        req.flash("error_msg", "No existe ningun usuario con ese email y contraseña");
        return res.redirect('/business/login')
    }

    req.logIn(user, function(err) {
    if(err) {
        return next(err);
    }

    res.redirect("/business/dashboard");

    });

    })(req, res, next);
});



router.get("/logout", ensureAuthenticated, function(req , res){
    req.logout();
    req.flash('success_msg', 'Ya se cerró la sessión')
	res.redirect("/business/login");
});

module.exports = router;