const express  = require('express');
const router = express.Router();
const {ensureAuthenticated } = require('../config/auth');



//ROUTES

router.get("/", ensureAuthenticated, function(req, res){
	res.redirect("/dashboard");
});

router.get("/dashboard", ensureAuthenticated, function(req, res){
	res.render("dashboard");
});



router.get("*", ensureAuthenticated, function(req, res){
	res.redirect("/dashboard");
});



module.exports = router;