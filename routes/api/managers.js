const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { authenticateTokenManager } = require("../../config/auth");
const passport = require("passport");
const jwt = require("jsonwebtoken");
var crypto = require("crypto");
var async = require("async");
const Order = require("../../models/order");
const Manager = require("../../models/manager");

//Managers API

router.post("/login", (req, res, next) => {
  passport.authenticate("local-manager-signup", (err, manager, info) => {
    if (err) {
      return next(err);
    }

    if (!manager) {
      return res.json({
        isError: true,
        message: "Cuenta de negocio no encontrada!",
      });
    }

    req.logIn(manager, function (err) {
      if (err) {
        return next(err);
      }
      // User Found

      const userTokenObject = {
        id: manager._id,
        email: manager.email,
      };
      const accessToken = jwt.sign(
        userTokenObject,
        process.env.ACCESS_TOKEN_SECRET_MANAGER
      );
      res.json({ accessToken: accessToken });
    });
  })(req, res, next);
});

router.get("/orders", authenticateTokenManager, function (req, res) {
  Manager.findById(req.manager.id)
    .then((manager) => {
      Order.find({
        deliveryDate: { $gte: Date.now() },
        business: manager.business,
      })
        .sort({ orderDate: -1 })
        .populate("user")
        .exec((err, orders) => {
          if (err) {
            console.log(err);
          } else {
            res.json( orders );
          }
        });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
