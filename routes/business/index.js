const express  = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../../config/auth");
const Order = require('../../models/order');



//ROUTES
router.get("/", ensureAuthenticated, function(req, res){
	res.redirect("/business/dashboard");
});

router.get("/dashboard", ensureAuthenticated, function(req, res){
	const now = new Date();
	const today = new  Date(now.getFullYear() , now.getMonth() , now.getDate());
	today.setHours(0, 0, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const twoDays = new Date(tomorrow);
	twoDays.setDate(twoDays.getDate() + 1);

	const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysP = new Date(yesterday);
    twoDaysP.setDate(twoDaysP.getDate() - 1);
    const ThreeDaysP = new Date(twoDaysP);
    ThreeDaysP.setDate(ThreeDaysP.getDate() - 1);
    const FourDaysP = new Date(ThreeDaysP);
	FourDaysP.setDate(FourDaysP.getDate() - 1);

	//console.log(yesterday);
	//console.log(twoDaysP);
	//console.log(ThreeDaysP);
	//console.log(FourDaysP);
	var ordersToday = 0;
	var deliveriesToday = 0;
	var deliveriesTommorow = 0;	
	var numFour = 0;
	var numThree = 0;
	var numtwo = 0;
	var numOne = 0;

	Order.find({orderDate: {$gte: today}}, (err, orders) => {
		if(err){
			console.log(err);
		}else{
			ordersToday = orders.length;
			Order.find({ $and: [{deliveryDate: {$gte: today}},{deliveryDate: {$lt: tomorrow}}]}, (err, orders) => {
				if(err){
					console.log(err);
				}else{
					deliveriesToday = orders.length;

					Order.find({ $and: [{deliveryDate: {$gte: tomorrow}},{deliveryDate: {$lt: twoDays}}]}, (err, orders) => {
						if(err){
							console.log(err);
						}else{
							deliveriesTommorow = orders.length;
							Order.find({ $and: [{orderDate: {$gte: yesterday}},{orderDate: {$lt: today}}]}, (err, orders) => {
								if(err){
									console.log(err);
								}else{
									
									numOne = orders.length;
									
									Order.find({ $and: [{orderDate: {$gte: twoDaysP}},{orderDate: {$lt: yesterday}}]}, (err, orders) => {
										if(err){
											console.log(err);
										}else{
											numtwo = orders.length;
											
											Order.find({ $and: [{orderDate: {$gte: ThreeDaysP}},{orderDate: {$lt: twoDaysP}}]}, (err, orders) => {
												if(err){
													console.log(err);
												}else{
													numThree = orders.length;
				
													Order.find({ $and: [{orderDate: {$gte: FourDaysP}},{orderDate: {$lt: ThreeDaysP}}]}, (err, orders) => {
														if(err){
															console.log(err);
														}else{
															//console.log(orders);
															numFour = orders.length;

															const data = {
																ordersToday: ordersToday,
																deliveriesToday: deliveriesToday,
																deliveriesTommorow: deliveriesTommorow,
																graph: [numFour, numThree, numtwo, numOne,ordersToday]
															}
														
															//console.log(data);
														
															res.render("business/dashboard", {data: data});
						
															
														}
													});
												}
											});
											
										}
									});

								}
							});

						}
					});

				}
			});

		}
	});
	
});





module.exports = router;