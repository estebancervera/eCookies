const express  = require('express');
const router = express.Router();
const { ensureAuthenticated } = require("../../config/auth");
const passport = require("passport");
const nodemailer = require('nodemailer');
const async = require("async");
const crypto = require("crypto");
								 
const Order = require('../../models/order');
const Manager = require('../../models/manager');



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

	Order.find({orderDate: {$gte: today}, business: req.user.business}, (err, orders) => {
		if(err){
			console.log(err);
		}else{
			ordersToday = orders.length;
			Order.find({ $and: [{deliveryDate: {$gte: today}},{deliveryDate: {$lt: tomorrow}},{business:req.user.business}]}, (err, orders) => {
				if(err){
					console.log(err);
				}else{
					deliveriesToday = orders.length;

					Order.find({ $and: [{deliveryDate: {$gte: tomorrow}},{deliveryDate: {$lt: twoDays}},{business:req.user.business}]}, (err, orders) => {
						if(err){
							console.log(err);
						}else{
							deliveriesTommorow = orders.length;
							Order.find({ $and: [{orderDate: {$gte: yesterday}},{orderDate: {$lt: today}},{business:req.user.business}]}, (err, orders) => {
								if(err){
									console.log(err);
								}else{
									
									numOne = orders.length;
									
									Order.find({ $and: [{orderDate: {$gte: twoDaysP}},{orderDate: {$lt: yesterday}},{business:req.user.business}]}, (err, orders) => {
										if(err){
											console.log(err);
										}else{
											numtwo = orders.length;
											
											Order.find({ $and: [{orderDate: {$gte: ThreeDaysP}},{orderDate: {$lt: twoDaysP}},{business:req.user.business}]}, (err, orders) => {
												if(err){
													console.log(err);
												}else{
													numThree = orders.length;
				
													Order.find({ $and: [{orderDate: {$gte: FourDaysP}},{orderDate: {$lt: ThreeDaysP}},{business:req.user.business}]}, (err, orders) => {
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


// manager password change

router.get('/forgot', function(req, res) {
	res.render('business/forgot');
  });
  
router.post('/forgot', function(req, res, next) {
	async.waterfall([
	  function(done) {
		crypto.randomBytes(20, function(err, buf) {
		  var token = buf.toString('hex');
		  done(err, token);
		});
	  },
	  function(token, done) {
		Manager.findOne({ email: req.body.email }, function(err, user) {
		  if (!user) {
			req.flash('error_msg', 'No existe ninguna cuenta con ese email.');
			return res.redirect('/business/forgot');
		  }
  
		  user.resetPasswordToken = token;
		  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
		  user.save(function(err) {
			done(err, token, user);
		  });
		});
	  },
	  function(token, user, done) {

		var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
			  user: 'noreply.ecookies@gmail.com',
			  pass: 'dabingPenguin2205'
			}
		  });

		var mailOptions = {
		  to: user.email,
		  from: 'noreply.ecookies@gmail.com',
		  subject: 'Cambiar contraseña',
		  html: ` 
					  <h4> Estas recibiendo este mensaje porque usted (o alguien mas) pidio un cambio de contraseña para su cuenta de eCookies.\n
						 Por favor haga click en el siguiente link para cambiarla. <h4> 
					 
					  <a>http://localhost:3000/business/reset/${token}<a>
					  <h6> Si Usted no pidio este cambio, simplemente ignore este mensaje. <h6> `
		};
		transporter.sendMail(mailOptions, function(err) {
		  console.log('mail sent');
		  req.flash('success_msg', 'Se envió un email a ' + user.email + ' con las intrucciones.');
		  done(err, 'done');
		});
	  }
	], function(err) {
	  if (err) return next(err);
	  res.redirect('/business/forgot');
	});
});


// RESET PASSWORD

router.get('/reset/:token', function(req, res) {
	Manager.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
	  if (!user) {
		req.flash('error_msg', 'El token de la contraseña ya no es valido');
		return res.redirect('/business/forgot');
	  }
	  res.render('business/reset', {token: req.params.token});
	});
  });
  
router.post('/reset/:token', function(req, res) {
	async.waterfall([
	  function(done) {
		Manager.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
		  if (!user) {
			req.flash('error_msg', 'El token de la contraseña ya no es valido');
			return res.redirect('back');
		  }
		  if(req.body.password === req.body.confirm) {
			user.setPassword(req.body.password, function(err) {
			  user.resetPasswordToken = undefined;
			  user.resetPasswordExpires = undefined;
  
			  user.save(function(err) {
				req.logIn(user, function(err) {
				  done(err, user);
				});
			  });
			})
		  } else {
			  req.flash("error_msg", "Las contraseñas no son iguales");
			  return res.redirect('back');
		  }
		});
	  },
	  function(user, done) {
		var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
			  user: 'noreply.ecookies@gmail.com',
			  pass: 'dabingPenguin2205'
			}
		  });

		var mailOptions = {
		  to: user.email,
		  from: 'noreply.ecookies@gmail.com',
		  subject: 'Contraseña cambiada!',
		  html: ` 
					  <h4> Se ha realizado un cam'''bio de contraseña para tu cuenta de eCookies. <h4> `
		};
		transporter.sendMail(mailOptions, function(err) {
		  console.log('mail sent');
		  req.flash('success_msg', 'Se cambio la contraseña exitosamente');
		  done(err, 'done');
		});
	  }
	], function(err) {
	  res.redirect('/business/dashboard');
	});
  });

module.exports = router;