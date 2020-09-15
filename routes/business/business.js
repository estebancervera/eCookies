const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../../config/auth");
const mongoose = require("mongoose");
const path = require('path');
const crypto = require("crypto");
const fs = require('fs');
const {promisify } = require('util');
const bcrypt = require('bcryptjs');
const passport = require('passport');

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
const Business = require("../../models/business");
const Manager = require("../../models/manager");

router.get("/", ensureAuthenticated, function (req, res) {
    Business.findById(req.user.business, function (err, business) {
    if (err) {
      console.log("ERROR: F : " + err);
    } else {
      //console.log(";successfull find");
      res.render("business/business/show", { business: business });
    }
  });
});

//EDIT

router.get("/:id/edit", ensureAuthenticated, function (req, res) {
  Business.findById(req.user.business, function (err, foundBusiness) {
    if (err) {
      res.redirect("/");
    } else {
      
      res.render("business/business/edit", { business: foundBusiness });
    }
  });
});


//UPDATE ROUTE

router.put("/:id", ensureAuthenticated,upload.array('file', 1), function (req, res) {

    var available = req.body.business.available;

    if (available === "on") {
      req.body.business.available = true;
    } else {
      req.body.business.available = false;
    }

    if(req.files[0]){
      Business.findById(req.params.id, (err, found)=>{
        if (err){
          console.log(err);
          req.flash("error_msg", "Error al editar el negocio. Intente mas tarde")
          res.redirect("/business/mybusiness")
        }else{
        const imageFilename = found.image
        const params = {
          Bucket: S3_BUCKET,
          Key: imageFilename
        };
       
        deleteS3(params);
    
        found.image = req.files[0].key;
 
        found.save();
      }
    
      });
    }
    
  

  Business.findByIdAndUpdate(req.user.business, req.body.business, function (
    err,
    updatedBusiness
  ) {
    if (err) {
      console.log(err);
      req.flash("error_msg", "Error al editar el negocio. Intente mas tarde")
      res.redirect("/business/mybusiness")
    } else {
     
      req.flash("edit_msg", "Negocio editado exitosamente")
      res.redirect("/business/mybusiness")
    }
  });

});


module.exports = router;
