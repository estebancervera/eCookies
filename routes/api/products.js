const express  = require('express');
const router = express.Router();
const {authenticateToken } = require('../../config/auth')

const Product = require('../../models/product');

//PRODUCTS API

router.get("/products", authenticateToken,(req, res) => {

	Product.find({}, function(err, products){
		if(err){
			console.log("ERROR: api : " + err);
		}else{;
			//console.log(";successfull find");
			res.json(products);
		};
	});

});


module.exports = router;