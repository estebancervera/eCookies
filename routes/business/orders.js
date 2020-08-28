const express  = require('express');
const router = express.Router();
const moment = require('moment-timezone');


const { ensureAuthenticated } = require("../../config/auth");

const Order = require("../../models/order");
const User = require("../../models/user");

router.get("/",ensureAuthenticated, function(req, res){
	Order.find({
		deliveryDate: {$gte : Date.now()}, business: req.user.business

	}).sort({deliveryDate : -1}).exec((err, orders)=> {

		if(err){
			console.log(err);
		}else{
			res.render("business/orders", {orders: orders, moment: moment});
		}
			
	})

	
});

router.get("/:id/show",ensureAuthenticated, function(req, res){

	//can be done better with .populate()
	
	User.findOne({ "orders" : req.params.id}, function(err, user){
		if (err){
			console.log("failed show");
			res.redirect("business/orders");
		}else{
			//console.log("-----------------")
			//console.log(user);

			Order.findById(req.params.id, (err, order) =>{
				if(err){
					console.log(err);
					res.redirect("business/orders");
				}
				else{
					const data = {
						user: user,
						order: order
					}

					res.render("business/show", {data: data})
				}
			});
		}
});
	
});

router.get("/:id/status/rejected",ensureAuthenticated, function(req, res){
	
	Order.findById(req.params.id, (err, order) => {
		if(err){
			console.log(err)
		}else{
			if(order){
				if(order.business.equals(req.user.business)){
					
					if(order.status === "pending"){
						
						order.status = "rejected";
						order.save();
					}
					
				}
				res.redirect(`/business/orders/${req.params.id}/show`);
				
			}
			
		}
	});

});
router.get("/:id/status/accepted",ensureAuthenticated, function(req, res){
	
	Order.findById(req.params.id, (err, order) => {
		if(err){
			console.log(err)
		}else{
			if(order){
				if(order.business.equals(req.user.business)){
					
					if(order.status === "pending"){
						
						order.status = "accepted";
						order.save();
					}
					
				}
				res.redirect(`/business/orders/${req.params.id}/show`);
				
			}
			
		}
	});

});

module.exports = router;