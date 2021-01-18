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
const push = require("../../config/notifications");

//Managers API
router.get("/", authenticateTokenManager, function (req, res) {
  Manager.findById(req.manager.id)
    .populate("business")
    .then((manager) => res.json({ email: manager.email, business: manager.business }))
    .catch((err) => console.log(err));
});

router.get("/business/toggle", authenticateTokenManager, async (req, res) => {
  Business.findOne({ manager: req.manager._id })
    .then((business) => {
      business.available = !business.available;
      console.log(business);
      business.save();
      res.json({
        isError: false,
        message: business.available
          ? "Se cambio el estado del negocio a disponible"
          : "Se cambio el estado del negocio a no disponible",
      });
    })
    .catch((err) => console.log(err));
});

router.get("/business/:lat/:lon", authenticateTokenManager, function (req, res) {
  Business.findOne({ manager: req.manager._id })
    .then((business) => {
      business.lat = req.params.lat;
      business.lon = req.params.lon;
      console.log(business);
      business.save();
      res.json({
        isError: false,
        message: "Se cambio la ubicación del negocio correctamente",
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        isError: true,
        message:
          "Lo sentimos hubo un error al intentar cambiar la ubicación del negocio. Intente mas tarde o contacte a soporte.",
      });
    });

  // Business.find({ manager: req.manager._id }, (err, business) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     business.lon = req.params.lon;
  //     business.lat = req.params.lat;
  //     business.save();
  //     res.json({
  //       isError: false,
  //       message: "Se cambio la ubicacion del negocio.",
  //     });
  //   }
  // });
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

router.get("/order/:id/rejected", authenticateTokenManager, async function (req, res) {
  var manager = await Manager.findById(req.manager.id).catch((err) => console.log(err));

  Order.findById(req.params.id)
    .then((order) => {
      console.log("1");
      if (order.business.equals(manager.business)) {
        console.log(req.manager);
        console.log("2");
        if (order.status === "pending") {
          console.log("3");
          order.status = "rejected";
          order.save();

          const registrationIds = [];
          user.devices.forEach((device) => {
            registrationIds.push(device);
          });

          const data = require("../../config/data")(
                    "Orden Rechazada",
                    "Su orden ha sido rechazada por el negocio."
                  );

          push
            .send(registrationIds, data)
            .then((results) => {
              console.log(results);
            })
            .catch((err) => {
              console.log(err);
            });

          console.log("4");
          res.json({ order: order._id, status: order.status });
        }
      }
      res.status(200);
    })
    .catch((err) => console.log(err));
});

router.get("/order/:id/accepted", authenticateTokenManager, function (req, res) {

  var manager = await Manager.findById(req.manager.id).catch((err) => console.log(err));

  Order.findById(req.params.id)
    .then((order) => {
      console.log("1");
      if (order.business.equals(manager.business)) {
      console.log(req.manager);
      console.log("2");
      if (order.status === "pending") {
        console.log("3");
        order.status = "accepted";
        order.save();

        const registrationIds = [];
        user.devices.forEach((device) => {
          registrationIds.push(device);
        });

        const data = require("../../config/data")(
                  "Orden Acceptada",
                  "Su orden ha sido acceptada por el negocio!"
                );

        push
          .send(registrationIds, data)
          .then((results) => {
            console.log(results);
          })
          .catch((err) => {
            console.log(err);
          });

        console.log("4");
        res.json({ order: order._id, status: order.status });
      }
       }
      res.status(200);
    })
    .catch((err) => console.log(err));
});

router.get("/order/:id/delivered", authenticateTokenManager, function (req, res) {

  var manager = await Manager.findById(req.manager.id).catch((err) => console.log(err));

  console.log("1");
  Order.findById(req.params.id)
    .then((order) => {
      if (order.business.equals(manager.business)) {
      console.log(req.manager);
      console.log("2");
      if (order.status === "accepted") {
        console.log("3");
        order.status = "delivered";
        order.save();
        console.log("4");

        const registrationIds = [];
        manager.devices.forEach((device) => {
          registrationIds.push(device);
        });

       const data = require("../../config/data")(
                  "Orden Entregada",
                  "Su orden ha sido entregada!"
                );

        push
          .send(registrationIds, data)
          .then((results) => {
            console.log(results);
          })
          .catch((err) => {
            console.log(err);
          });

        res.json({ order: order._id, status: order.status });
      }
      }
      res.status(200);
    })
    .catch((err) => console.log(err));
});

module.exports = router;
