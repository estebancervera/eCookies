const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../config/auth");
const mongoose = require("mongoose");
const path = require('path');
const crypto = require("crypto");
const fs = require('fs');
const {promisify } = require('util');

const directoryPath = path.join(__dirname, 'uploads');
const aws = require("aws-sdk");
const multer = require('multer');
const multerS3 = require("multer-s3");

const S3_BUCKET = process.env.S3_BUCKET;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

aws.config.update({
  secretAccessKey: AWS_SECRET_ACCESS_KEY ,
  accessKeyId: AWS_ACCESS_KEY_ID,
  region: 'us-east-1'
});
// arn:aws:iam::256293732345:user/Esteban
const s3 = new aws.S3();



  const storage = multerS3({
      s3: s3,
      bucket: S3_BUCKET,
      key: function (req, file, cb) {
          console.log(file);
          cb(null, Date.now() + crypto.randomBytes(8).toString("hex") + path.extname(file.originalname)); //use Date.now() for unique file keys
      }
  });


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


const deleteS3 = function (params) {
  return new Promise((resolve, reject) => {
      s3.createBucket({
          Bucket: S3_BUCKET 
      }, function () {
          s3.deleteObject(params, function (err, data) {
              if (err) console.log(err);
              else
                  console.log(
                      "Successfully deleted file from bucket"
                  );
              console.log(data);
          });
      });
  });
};

// Product Model
const Product = require("../../models/product");
const Category = require("../../models/category");

router.get("/", ensureAuthenticated, function (req, res) {
  Category.find({business: req.user.business}).populate('products').exec(function (err, categories) {
    if (err) {
      console.log("ERROR: F : " + err);
    } else {
     
      var productsArrays = categories.map(function(x){
        return x.products;
      })
      
      productsArrays = productsArrays.flat();

      res.render("business/products/products", { products: productsArrays });
    }
  });
});

router.get("/new", ensureAuthenticated, function (req, res) {

Category.find({business: req.user.business}, (err, categories) => {
  if(err){
    console.log(err);
    res.render("business/products/products")

  }else{

    res.render("business/products/new", { categories: categories });

  }
});

});

//EDIT

router.get("/:id/edit", ensureAuthenticated, function (req, res) {


  Category.find({}, (err, categories) => {
    if(err){
      console.log(err);
      res.redirect("/business/products/")
  
    }else{
  
      Product.findById(req.params.id, function (err, foundProduct) {
        if (err) {
          res.redirect("/");
        } else {
          const data = {
            product: foundProduct,
            categories: categories
          }

          res.render("business/products/edit", { data: data });
        }
      });
  
    }
  });


});

//CREATE

router.post("/", ensureAuthenticated, upload.array('file', 1), function (req, res) {
  var isAvailable = req.body.product.available;

  if (isAvailable === "on") {
    req.body.product.available = true;
  } else {
    req.body.product.available = false;
  }

  console.log(req.files[0].key);

  const product = new Product({
    name: req.body.product.name,
    description: req.body.product.description,
    price: req.body.product.price,
    available: req.body.product.available,
    image: req.files[0].key,
    category: req.body.product.category
  });

  //req.body.product.description = req.sanitize(req.body.product.description);

  Product.create(product, function (err) {
    if (err) {
      console.log("ERROR: " + err);
      res.render("business/products/new");
    } else {

      Category.findOneAndUpdate({ _id: req.body.product.category}, {$push: {products: product}}, (err, result) =>{
        if(err){
            console.log(err);
        }else{
          res.redirect("/business/products");
            
        }
    });

     
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
    console.log(err);
  } else {
    console.log(updatedProduct);
    console.log(req.body.product);
    Category.findOneAndUpdate({ _id: req.body.product.category}, {$push: {products: updatedProduct}}, (err, result) =>{
      if(err){
          console.log(err);
      }else{
        res.redirect("/business/products");
          
      }
  });


  Category.findById( updatedProduct.category, (err, category)=>{
    if(err){
      console.log(err);
 
    }else{
      
     console.log(category)
      const index = category.products.indexOf(req.body.product.id);
      category.products.splice(index, 1);
      category.save();
      console.log(category)
 
 
    }
  });


   
  }
});

 
});

//DELETE ROUTE

router.delete("/:id", ensureAuthenticated, function (req, res) {


  

  Product.findOne({_id: req.params.id}, (err, product) => {
     const imageFilename = product.image
     const params = {
       Bucket: S3_BUCKET,
       Key: imageFilename
     };
   
     deleteS3(params);
  });

 


  Product.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      res.redirect("/business/products");
    } else {
      res.redirect("/business/products");
    }
  });
});




module.exports = router;
