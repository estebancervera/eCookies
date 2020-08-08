const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
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
              
          });
      });
  });
};

// Category Model
const Category = require("../models/category");

router.get("/", ensureAuthenticated, function (req, res) {
    Category.find({}, function (err, categories) {
    if (err) {
      console.log("ERROR: F : " + err);
    } else {
      //console.log(";successfull find");
      res.render("categories/categories", { categories: categories });
    }
  });
});

router.get("/new", ensureAuthenticated, function (req, res) {
  res.render("categories/new");
});

//EDIT

router.get("/:id/edit", ensureAuthenticated, function (req, res) {
  Category.findById(req.params.id, function (err, foundCategory) {
    if (err) {
      res.redirect("/");
    } else {
      
      res.render("categories/edit", { category: foundCategory });
    }
  });
});

//CREATE

router.post("/", ensureAuthenticated, upload.array('file', 1), function (req, res) {
  var qtyRestricted = req.body.category.qtyRestricted;

  if (qtyRestricted === "on") {
    req.body.category.qtyRestricted = true;
  } else {
    req.body.category.qtyRestricted = false;
  }

  //console.log(req.body.category);

  const category = new Category({
    name: req.body.category.name,
    image: req.files[0].key,
    qtyRestricted: req.body.category.qtyRestricted,
    packageSizes: req.body.category.sizes,
    timeRequired: req.body.category.timeRequired
  });

  //req.body.product.description = req.sanitize(req.body.product.description);

  Category.create(category, function (err) {
    if (err) {
      console.log("ERROR: " + err);
      res.render("categories/new");
    } else {
      res.redirect("/categories");
    }
  });
});

//UPDATE ROUTE

router.put("/:id", ensureAuthenticated, function (req, res) {

  var qtyRestricted = req.body.category.qtyRestricted;

  //console.log(req.body.category.packageSizes)

  if (qtyRestricted === "on") {
   req.body.category.qtyRestricted = true;
 } else {
   req.body.category.qtyRestricted = false;
  }

  

  Category.findByIdAndUpdate(req.params.id, req.body.category, function (
    err,
    updatedCategory
  ) {
    if (err) {
      console.log(err);
      res.redirect("/categories");
    } else {
     
      res.redirect("/categories");
    }
  });

});

//DELETE ROUTE

router.delete("/:id", ensureAuthenticated, function (req, res) {

  Category.findOne({_id: req.params.id}, (err, category) => {
    const imageFilename = category.image
    const params = {
      Bucket: S3_BUCKET,
      Key: imageFilename
    };
  
    deleteS3(params);

    category.remove();

    res.redirect("/categories");

  });

  
});




module.exports = router;
