const express  = require('express');
const router = express.Router();
const {ensureAuthenticated } = require('../config/auth');
const Order = require('../models/order');


//ROUTES

router.get("/", ensureAuthenticated, function(req, res){
	res.redirect("/dashboard");
});

router.get("/dashboard", ensureAuthenticated, function(req, res){
	res.render("dashboard");
});

router.get("/orders", ensureAuthenticated, function(req, res){
	Order.find({}, (err, orders)=> {
		res.render("orders", {orders: orders});
	})

	
});

router.get("*", ensureAuthenticated, function(req, res){
	res.redirect("/dashboard");
});



module.exports = router;