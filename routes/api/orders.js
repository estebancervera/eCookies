const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../config/auth");
var mongoose = require("mongoose");

const Order = require("../../models/order");
const User = require("../../models/user");
const Manager = require("../../models/user");

const push = require("../../config/notifications");

//PRODUCTS API

router.get("/", authenticateToken, (req, res) => {
  console.log(req.user);
  Order.find({ user: req.user.id })
    .populate("business")
    .then((orders) => {
      if (!orders) {
        console.log(user);
        res.json({ message: "Token invalid, no User with that token" });
      } else {
        res.json(orders);
      }
    })
    .catch((err) => console.log(err));
});

router.post("/", authenticateToken, async (req, res) => {
  var id = mongoose.Types.ObjectId(req.body.business);

  var manager = await Manager.findOne({}).catch((err) => console.log(err));
  console.log("-----------------");
  console.log(manager);
  console.log("-----------------");
  console.log(req.body.business);
  const order = new Order({
    user: req.user.id,
    packets: req.body.packets,
    deliveryDate: req.body.deliveryDate * 1000,
    business: req.body.business,
  });

  User.findById(req.user.id, (err, user) => {
    if (err) {
      res.json({ isError: true, message: "No se pudo crear la orden." });
      console.log(err);
    } else {
      if (user.banned) {
        res.json({
          isError: true,
          message:
            "Tu cuenta ha sido reportada por un negocio por no recoger un pedido. No podra hacer ninguna nueva orden. Contacte al negocio para más información.",
        });
      } else {
        Order.create(order, (err, order) => {
          if (err) {
            res.json({ isError: true, message: "No se pudo crear la orden." });
            console.log(err);
          } else {
            User.findOneAndUpdate({ _id: req.user.id }, { $push: { orders: order } }).exec((err, user) => {
              if (err) {
                res.json({
                  isError: true,
                  message: "Hubo un error con la orden",
                });
              } else {
                res.json({
                  isError: false,
                  message: "Orden agregada exitosamente!",
                });

                const registrationIds = [];
                user.devices.forEach((device) => {
                  registrationIds.push(device);
                });

                const data = require("../../config/data")(
                  "Orden Pendiente",
                  "Su orden ha sido creada y esta pendiente para su aprobación por el negocio."
                );

                push
                  .send(registrationIds, data)
                  .then((results) => {
                    console.log(results);
                  })
                  .catch((err) => {
                    console.log(err);
                  });

                const registrationIdsM = [];
                manager.devices.forEach((device) => {
                  registrationIdsM.push(device);
                });

                const dataM = require("../../config/data")("Nueva Orden", "Ha recibido una nueva orden!");

                push
                  .send(registrationIdsM, dataM)
                  .then((results) => {
                    console.log(results);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            });
          }
        });
      }
    }
  });
});

module.exports = router;
