const express  = require('express');
const router = express.Router();


const {ensureAuthenticated } = require('../config/auth');

const Order = require("../models/order");
const User = require("../models/user");

router.get("/",ensureAuthenticated, function(req, res){
	User.find({
		"orders.deliveryDate": {$gte : Date.now()} 

	}, (err, users)=> {

		console.log(users);

		res.render("orders", {users: users});

	})

	
});

router.get("/:id/show",ensureAuthenticated, function(req, res){
	
	User.find({ "orders._id" : req.params.id}, function(err, user){
		if (err){
			console.log("failed show");
			res.redirect("/orders");
		}else{
			console.log("-----------------")
			console.log(user);

			
		}
});
	
});


module.exports = router;