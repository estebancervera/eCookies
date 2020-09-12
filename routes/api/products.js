const express  = require('express');
const router = express.Router();
const {authenticateToken } = require('../../config/auth')

const Product = require('../../models/product');
const Business = require('../../models/business');

//PRODUCTS API

router.get("/business",(req, res) => {

	Business.find({}).populate({path: 'categories', populate : {path: 'products'}}).exec( function(err, data){
		if(err){
			res.json({isError: true, message: "Error loading products"});
		}else{
			//console.log(";successfull find");
			console.log(data)
			res.json(data);
		};
	});

});





module.exports = router;