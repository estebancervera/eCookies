const express  = require('express');
const router = express.Router();
const {ensureAuthenticated } = require('../config/auth');
const Order = require('../models/order');



//ROUTES

router.get("/", ensureAuthenticated, function(req, res){
	res.redirect("/dashboard");
});

router.get("/dashboard", ensureAuthenticated, function(req, res){
	const now = new Date();
	const today = new  Date(now.getFullYear() , now.getMonth() , now.getDate());
	today.setHours(0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	console.log(tomorrow);
	const twoDays = new Date(tomorrow);
	twoDays.setDate(twoDays.getDate() + 1);
	console.log(twoDays);

	var ordersToday = 0;
	var deliveriesToday = 0;
	var deliveriesTommorow = 0;	

	Order.find({orderDate: {$gte: today}}, (err, orders) => {
		if(err){
			console.log(err);
		}else{
			ordersToday = orders.length
		}
	});
	Order.find({ $and: [{deliveryDate: {$gte: today}},{deliveryDate: {$lt: tomorrow}}]}, (err, orders) => {
		if(err){
			console.log(err);
		}else{
			deliveriesToday = orders.length
		}
	});
	Order.find({ $and: [{deliveryDate: {$gte: tomorrow}},{deliveryDate: {$lt: twoDays}}]}, (err, orders) => {
		if(err){
			console.log(err);
		}else{
			deliveriesToday = orders.length
		}
	});

	const data = {
		ordersToday: ordersToday,
		deliveriesToday: deliveriesToday,
		deliveriesTommorow: deliveriesTommorow
	}


	res.render("dashboard", {data: data});
});



router.get("*", ensureAuthenticated, function(req, res){
	res.redirect("/dashboard");
});



module.exports = router;