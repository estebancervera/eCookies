const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
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
const Business = require("../models/business");
const Manager = require("../models/manager");

router.get("/", ensureAuthenticated, function (req, res) {
    Business.find({}, function (err, business) {
    if (err) {
      console.log("ERROR: F : " + err);
    } else {
      //console.log(";successfull find");
      res.render("businesses/businesses", { business: business });
    }
  });
});

router.get("/new", ensureAuthenticated, function (req, res) {
  res.render("businesses/new");
});

//EDIT

router.get("/:id/edit", ensureAuthenticated, function (req, res) {
  Business.findById(req.params.id, function (err, foundBusiness) {
    if (err) {
      res.redirect("/");
    } else {
      
      res.render("businesses/edit", { business: foundBusiness });
    }
  });
});

//CREATE

router.post("/", ensureAuthenticated, upload.array('file', 1), function (req, res) {
  var available = req.body.business.available;

  if (available === "on") {
    req.body.business.available = true;
  } else {
    req.body.business.available = false;
  }


  const { email, password } = req.body.manager;

  const business = new Business({
    name: req.body.business.name,
    image: req.files[0].key,
    available: req.body.business.available,
    lon: req.body.business.lon,
    lat: req.body.business.lat
  });

  Business.create(business, function (err, newBusiness) {
    if (err) {
      console.log("ERROR: " + err);
      res.render("businesses/new");
    } else {
        

        Manager.findOne({email: email})
        .then(user => {
            if(user){
                Business.deleteOne({_id: newBusiness.id}, (err) =>{
                    if(err){
                      console.log(err);
                    }else{
                      res.redirect("/businesses/new");
                    }
                });
               
            }else{
                const newAdmin = new Manager({
                    
                    email: email,
                    password: password,
                    business: newBusiness.id
                
                });

                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newAdmin.password, salt, (err, hash) =>{
                        if(err) throw err;
                        newAdmin.password = hash;

                        newAdmin.save()
                            .then(user => {
                                res.redirect("/businesses");
                            })
                            .catch(err => console.log(err));

                     }));
            }
        });


      
    }
  });

    
  //console.log(req.body.business);


  

  //req.body.product.description = req.sanitize(req.body.product.description);

 
});

//UPDATE ROUTE

router.put("/:id", ensureAuthenticated, function (req, res) {

    var available = req.body.business.available;

    if (available === "on") {
      req.body.business.available = true;
    } else {
      req.body.business.available = false;
    }

  

  Business.findByIdAndUpdate(req.params.id, req.body.business, function (
    err,
    updatedBusiness
  ) {
    if (err) {
      console.log(err);
      res.redirect("/businesses");
    } else {
     
      res.redirect("/businesses");
    }
  });

});

//DELETE ROUTE

router.delete("/:id", ensureAuthenticated, function (req, res) {

  Business.findOne({_id: req.params.id}, (err, business) => {
    const imageFilename = business.image
    const params = {
      Bucket: S3_BUCKET,
      Key: imageFilename
    };
  
    deleteS3(params);

    business.remove();
    res.redirect("/businesses");
  });

 
  
});




module.exports = router;
