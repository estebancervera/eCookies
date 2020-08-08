const express  = require('express');
const router = express.Router();


const {ensureAuthenticated } = require('../config/auth');

const Order = require("../models/order");
const User = require("../models/user");

router.get("/",ensureAuthenticated, function(req, res){
	Order.find({
		deliveryDate: {$gte : Date.now()} 

	}, (err, order)=> {

		//console.log(order);

		res.render("orders", {orders: order});

	})

	
});

router.get("/:id/show",ensureAuthenticated, function(req, res){

	
	
	User.findOne({ "orders" : req.params.id}, function(err, user){
		if (err){
			console.log("failed show");
			res.redirect("/orders");
		}else{
			console.log("-----------------")
			console.log(user);

			Order.findById(req.params.id, (err, order) =>{
				if(err){
					console.log(err);
					res.redirect("/orders");
				}
				else{
					const data = {
						user: user,
						order: order
					}

					res.render("show", {data: data})
				}
			});
		}
});
	
});


module.exports = router;