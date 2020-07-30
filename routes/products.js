const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const mongoose = require("mongoose");
const path = require('path');
const fs = require('fs');
const {promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const directoryPath = path.join(__dirname, 'uploads');

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads');
  },
  filename: function(req, file,cb){
     cb(null, Date.now() + file.originalname);
  }
})

const filefilter = (req, file,cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
  }else{
    cb(null, false);
  }
}

const upload = multer({
  storage: storage,
  fileFilter: filefilter
});

// Product Model
const Product = require("../models/product");

router.get("/", ensureAuthenticated, function (req, res) {
  Product.find({}, function (err, products) {
    if (err) {
      console.log("ERROR: F : " + err);
    } else {
      //console.log(";successfull find");
      res.render("products", { products: products });
    }
  });
});

router.get("/new", ensureAuthenticated, function (req, res) {
  res.render("new");
});

//EDIT

router.get("/:id/edit", ensureAuthenticated, function (req, res) {
  Product.findById(req.params.id, function (err, foundProduct) {
    if (err) {
      res.redirect("/");
    } else {
      res.render("edit", { product: foundProduct });
    }
  });
});

//CREATE

router.post("/", ensureAuthenticated, upload.single('file'), function (req, res) {
  var isAvailable = req.body.product.available;

  if (isAvailable === "on") {
    req.body.product.available = true;
  } else {
    req.body.product.available = false;
  }

  console.log(req.file);

  const product = new Product({
    name: req.body.product.name,
    description: req.body.product.description,
    price: req.body.product.price,
    available: req.body.product.available,
    image: req.file.path
  });

  //req.body.product.description = req.sanitize(req.body.product.description);

  Product.create(product, function (err) {
    if (err) {
      console.log("ERROR: " + err);
      res.render("new");
    } else {
      res.redirect("/products");
    }
  });
});

//UPDATE ROUTE

router.put("/:id", ensureAuthenticated, function (req, res) {
  var isAvailable = req.body.product.available;

  if (isAvailable === "on") {
    req.body.product.available = true;
  } else {
    req.body.product.available = false;
  }


 

  Product.findByIdAndUpdate(req.params.id, req.body.product, function (
    err,
    updatedProduct
  ) {
    if (err) {
      res.redirect("/products");
    } else {
      res.redirect("/products");
    }
  });
});

//DELETE ROUTE

router.delete("/:id", ensureAuthenticated, function (req, res) {

  Product.findOne({_id: req.params.id}, (err, product) => {
     unlinkAsync(product.image)
  });


  Product.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.redirect("/products");
    } else {
      res.redirect("/products");
    }
  });
});




module.exports = router;
