const express  = require('express');
const router = express.Router();
const moment = require('moment-timezone');

const {ensureAuthenticated, requireAdmin } = require('../config/auth');

const Order = require("../models/order");
const User = require("../models/user");

router.get("/",ensureAuthenticated,requireAdmin, function(req, res){
	Order.find({
		deliveryDate: {$gte : Date.now()} 

	}).populate("user")
	.then(orders => {
		res.render("orders", {orders: orders, moment: moment});  
    })
    .catch(err => console.log(err));

	
});

router.get("/:id/show",ensureAuthenticated,requireAdmin, function(req, res){

	Order.findById(req.params.id).populate("user")
	.then(order => {
		res.render("show", {order: order});  
    })
	.catch(err => res.redirect("/orders"));
	
	
// 	User.findOne({ "orders" : req.params.id}, function(err, user){
// 		if (err){
// 			console.log("failed show");
// 			res.redirect("/orders");
// 		}else{
// 			console.log("-----------------")
// 			console.log(user);

// 			Order.findById(req.params.id, (err, order) =>{
// 				if(err){
// 					console.log(err);
// 					res.redirect("/orders");
// 				}
// 				else{
// 					const data = {
// 						user: user,
// 						order: order
// 					}

// 					res.render("show", {data: data})
// 				}
// 			});
// 		}
// });
	
});


module.exports = router;