const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { ensureAuthenticated, authenticateEmailUser } = require("../config/auth");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
var async = require("async");
var crypto = require("crypto");
const moment = require("moment-timezone");

// USER MODEl
const User = require("../models/user");

//user admin view
router.get("/", (req, res) => {
  User.find({})
    .sort({ date: -1 })
    .populate("bannedBy")
    .exec((err, users) => {
      if (err) {
        console.log(err);
      } else {
        res.render("user", { users: users, moment: moment });
      }
    });
});

//REGISTER  POST
router.post("/register", (req, res) => {
  const { firstname, lastname, email, password, phone } = req.body;
  console.log(req.body);
  console.log(lastname);
  User.findOne({ email: email }).then((user) => {
    if (user) {
      if (user.verified) {
        console.log("user already registered");
        res.json({ isError: true, message: "Ya existe un usuario registrado con ese email." });
      } else {
        console.log("user isn't registered");
        User.findByIdAndRemove(user._id, (err) => {
          if (err) {
            res.json({ isError: true, message: "Hubo un error al registrarte. Intente mas tarde" });
          } else {
            res.json({
              isError: true,
              message:
                "Existia un usuario con este email pero no estaba verificado, este ya fue eliminado. Vuelva a intentar.",
            });
          }
        });
      }
    } else {
      const newUser = new User({
        firstname,
        lastname,
        email,
        password,
        phone,
      });

      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            console.log(err);
          }
          newUser.password = hash;

          newUser
            .save()
            .then((user) => {
              res.json({
                isError: false,
                message: "Se registro exitosamente al usuario. Por favor confirme su correo antes de iniciar sessión.",
              });
              console.log("user added");
            })
            .catch((err) => console.log(err));
        })
      );

      //SEND EMAIL FOR CONF
      const emailVerification = {
        id: newUser.id,
        email: newUser.email,
      };
      const verificationToken = jwt.sign(emailVerification, process.env.SIGNUP_TOKEN_SECRET);

      var transporter = nodemailer.createTransport({
        //service: "gmail",
        host: "smtp-relay.sendinblue.com",
        port: 587,
        auth: {
          user: "noreply.ecookies@gmail.com",
          pass:  process.env.MAIL_PSWD,
        },
      });

      transporter.verify(function (error, success) {
        if (error) {
          console.log(error);
        } else {
          console.log("Server is ready to take our messages");
        }
      });

      var mailOptions = {
        from: "noreply.ecookies@gmail.com",
        to: email,
        subject: "Verificación de Correo",
        html: ` 
                      <h2> Haga click en el link para verificar su correo </h2> 
                      <a href="https://www.ecookies.app/users/verification/${verificationToken}">https://www.ecookies.app/users/verification/${verificationToken}</a>
                      `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
  });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local-user-signup", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.json({ isError: true, message: "Usuario no encontrado!" });
    }

    if (!user.verified) {
      return res.json({ isError: true, message: "Usuario no esta verificado!" });
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      // User Found

      const userTokenObject = {
        id: user._id,
        email: user.email,
      };
      const accessToken = jwt.sign(userTokenObject, process.env.ACCESS_TOKEN_SECRET);
      res.json({ accessToken: accessToken });
    });
  })(req, res, next);
});

router.get("/verification/:token", authenticateEmailUser, (req, res) => {
  const { id, email } = req.user;
  User.findById(id, (err, found) => {
    if (err) {
      res.send("ERROR!");
    } else {
      found.verified = true;
      found.save();
      res.render("verify");
    }
  });
});

router.get("/:id/banned", ensureAuthenticated, function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) {
      console.log("failed report");
      req.flash("error_msg", "No se pudo reportar al usuario");
      res.redirect("/users/");
    } else {
      user.banned = true;

      user.save();
      req.flash("success_msg", "Usuario fue reportado!");
      res.redirect("/users/");
    }
  });
});

router.get("/:id/unbanned", ensureAuthenticated, function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) {
      console.log("failed report");
      req.flash("error_msg", "Error unbanning user");
      res.redirect("/users/");
    } else {
      user.banned = false;
      user.bannedBy = undefined;
      user.save();
      req.flash("success_msg", "User was unbanned!");
      res.redirect("/users/");
    }
  });
});

module.exports = router;
