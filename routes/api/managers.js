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
const Business = require("../../models/business");

//Managers API
router.get("/", authenticateTokenManager, function (req, res) {
  Manager.findById(req.manager.id)
    .populate("business")
    .then((manager) => res.json({ email: manager.email, business: manager.business }))
    .catch((err) => console.log(err));
});

router.get("/business/toggle", authenticateTokenManager, function (req, res) {
  Business.find({ manager: req.manager._id }, (err, business) => {
    if (err) {
      console.log(err);
    } else {
      business.available = !business.available;
      business.save();
      res.json({
        isError: false,
        message: business.available
          ? "Se cambio el estado del negocio a disponible"
          : "Se cambio el estado del negocio a no disponible",
      });
    }
  });
});

router.get("/business/:lat/:lon", authenticateTokenManager, function (req, res) {
  Business.find({ manager: req.manager._id }, (err, business) => {
    if (err) {
      console.log(err);
    } else {
      business.lon = req.params.lon;
      business.lat = req.params.lat;
      business.save();
      res.json({
        isError: false,
        message: "Se cambio la ubicacion del negocio.",
      });
    }
  });
});


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
      const accessToken = jwt.sign(userTokenObject, process.env.ACCESS_TOKEN_SECRET_MANAGER);
      res.json({ accessToken: accessToken });
    });
  })(req, res, next);
});

router.get("/orders", authenticateTokenManager, function (req, res) {
  Manager.findById(req.manager.id)
    .then((manager) => {
      Order.find({
        //deliveryDate: { $gte: Date.now() },
        business: manager.business,
      })
        .sort({ orderDate: -1 })
        .populate("user")
        .exec((err, orders) => {
          if (err) {
            console.log(err);
          } else {
            res.json(orders);
          }
        });
    })
    .catch((err) => console.log(err));
});

router.get("order/:id/rejected", authenticateTokenManager, async function (req, res) {
  Order.findById(req.params.id, (err, order) => {
    if (err) {
      console.log(err);
    } else {
      if (order) {
        if (order.business.equals(req.manager.business)) {
          if (order.status === "pending") {
            order.status = "rejected";
            order.save();
          }
        }
      }
    }
  });
});
router.get("order/:id/accepted", authenticateTokenManager, function (req, res) {
  Order.findById(req.params.id, (err, order) => {
    if (err) {
      console.log(err);
    } else {
      if (order) {
        if (order.business.equals(req.manager.business)) {
          if (order.status === "pending") {
            order.status = "accepted";
            order.save();
          }
        }
      }
    }
  });
});

router.get("order/:id/delivered", authenticateTokenManager, function (req, res) {
  Order.findById(req.params.id, (err, order) => {
    if (err) {
      console.log(err);
    } else {
      if (order) {
        if (order.business.equals(req.manager.business)) {
          if (order.status === "accepted") {
            order.status = "delivered";
            order.save();
          }
        }
      }
    }
  });
});

module.exports = router;
