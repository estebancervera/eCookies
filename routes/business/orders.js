const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");

const push = require("../../config/notifications");

const { ensureAuthenticated } = require("../../config/auth");

const Order = require("../../models/order");
const User = require("../../models/user");

router.get("/", ensureAuthenticated, function (req, res) {
  Order.find({
    deliveryDate: { $gte: Date.now() },
    business: req.user.business,
  })
    .sort({ orderDate: -1 })
    .populate("user")
    .exec((err, orders) => {
      if (err) {
        console.log(err);
      } else {
        res.render("business/orders", { orders: orders, moment: moment });
      }
    });
});

router.get("/:id/show", ensureAuthenticated, function (req, res) {
  Order.findById(req.params.id)
    .populate("user")
    .then((order) => {
      res.render("business/show", { order: order });
    })
    .catch((err) => res.redirect("business/orders"));

  //can be done better with .populate()

  // 	User.findOne({ "orders" : req.params.id}, function(err, user){
  // 		if (err){
  // 			console.log("failed show");
  // 			res.redirect("business/orders");
  // 		}else{
  // 			//console.log("-----------------")
  // 			//console.log(user);

  // 			Order.findById(req.params.id, (err, order) =>{
  // 				if(err){
  // 					console.log(err);
  // 					res.redirect("business/orders");
  // 				}
  // 				else{
  // 					const data = {
  // 						user: user,
  // 						order: order
  // 					}

  // 					res.render("business/show", {data: data})
  // 				}
  // 			});
  // 		}
  // });
});

router.get(
  "/:id/status/rejected",
  ensureAuthenticated,
  async function (req, res) {
    Order.findById(req.params.id, (err, order) => {
      if (err) {
        console.log(err);
      } else {
        if (order) {
          if (order.business.equals(req.user.business)) {
            if (order.status === "pending") {
              order.status = "rejected";
              order.save();

              User.findById(order.user)
                .then((user) => {
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
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          }
          res.redirect(`/business/orders/${req.params.id}/show`);
        }
      }
    });
  }
);
router.get("/:id/status/accepted", ensureAuthenticated, function (req, res) {
  Order.findById(req.params.id, (err, order) => {
    if (err) {
      console.log(err);
    } else {
      if (order) {
        if (order.business.equals(req.user.business)) {
          if (order.status === "pending") {
            order.status = "accepted";
            order.save();
            User.findById(order.user)
              .then((user) => {
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
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
        res.redirect(`/business/orders/${req.params.id}/show`);
      }
    }
  });
});

router.get("/:id/status/delivered", ensureAuthenticated, function (req, res) {
  Order.findById(req.params.id, (err, order) => {
    if (err) {
      console.log(err);
    } else {
      if (order) {
        if (order.business.equals(req.user.business)) {
          if (order.status === "accepted") {
            order.status = "delivered";
            order.save();

            User.findById(order.user)
              .then((user) => {
                const registrationIds = [];
                user.devices.forEach((device) => {
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
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
        res.redirect(`/business/orders/${req.params.id}/show`);
      }
    }
  });
});

router.get(
  "/:id/user/:userId/reported",
  ensureAuthenticated,
  function (req, res) {
    Order.findById(req.params.id, (err, order) => {
      if (err) {
        console.log("failed report");
        req.flash("error_msg", "No se pudo reportar al usuario");
        res.redirect("/business/orders");
      } else {
        User.findById(req.params.userId, function (err, user) {
          if (err) {
            console.log("failed report");
            req.flash("error_msg", "No se pudo reportar al usuario");
            res.redirect("/business/orders");
          } else {
            user.banned = true;
            user.bannedBy = order.business;
            user.save();

            const registrationIds = [];
            user.devices.forEach((device) => {
              registrationIds.push(device);
            });

            const data = require("../../config/data")(
              "Cuenta Reportada",
              "Usted ha sido reportado por un negocio por no cumplir con una de sus ordenes. Contacte al negocio si desea volver a poder hacer pedidos."
            );

            push
              .send(registrationIds, data)
              .then((results) => {
                console.log(results);
              })
              .catch((err) => {
                console.log(err);
              });

            req.flash("success_msg", "Usuario fue reportado!");
            res.redirect("/business/orders");
          }
        });
      }
    });
  }
);

module.exports = router;
