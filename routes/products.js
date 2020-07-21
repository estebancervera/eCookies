const express  = require('express');
const router = express.Router();
const {ensureAuthenticated } = require('../config/auth')


// Product Model
const Product = require("../models/product")

router.get("/",ensureAuthenticated, function(req, res){
	Product.find({}, function(err, products){
	if(err){
		console.log("ERROR: F : " + err);
	}else{;
		//console.log(";successfull find");
		res.render("products", {products: products});
	};
});
	
});

router.get("/new",ensureAuthenticated, function(req, res){
	res.render("new");;
});	


//EDIT
	
router.get("/:id/edit",ensureAuthenticated, function(req, res){
	Product.findById(req.params.id, function(err, foundProduct){
					 if (err){
						 res.redirect("/")
					 }else{
						 res.render("edit", {product: foundProduct});
					 }
			});
	
});

//CREATE

router.post("/", ensureAuthenticated, function(req, res){
	
	var isAvailable = req.body.product.available;
	
	if(isAvailable === 'on'){
		req.body.product.available = true;
	}else{
		req.body.product.available = false;
	}
	
	//req.body.product.description = req.sanitize(req.body.product.description);
	
	Product.create( req.body.product, function(err){
	if(err){
		console.log("ERROR: " + err);
		res.render("new");
	}else{
		res.redirect("/products")
	}
});

});

//UPDATE ROUTE

router.put("/:id", ensureAuthenticated, function(req, res){
	
	var isAvailable = req.body.product.available;
	
	if(isAvailable === 'on'){
		req.body.product.available = true;
	}else{
		req.body.product.available = false;
	}
	
	//req.body.product.description = req.sanitize(req.body.product.description);
	
	Product.findByIdAndUpdate(req.params.id, req.body.product, function(err, updatedProduct){
		if(err){
			res.redirect("/products")
		}else{
			res.redirect("/products")
		}
	} );
	
});

//DELETE ROUTE


router.delete("/:id", ensureAuthenticated, function(req, res){
		Product.findByIdAndRemove(req.params.id, function(err){
			if(err){
				res.redirect("/products");
			}else{
				res.redirect("/products");
			}
		})
});
	



module.exports = router;