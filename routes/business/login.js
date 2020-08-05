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
    passport.authenticate('local-manager-signup', {
        successRedirect: "/business/dashboard", 
        failureRedirect: "/business/login"
    })(req, res, next);
});



router.get("/logout", ensureAuthenticated, function(req , res){
	req.logout();
	res.redirect("/business/login");
});

module.exports = router;