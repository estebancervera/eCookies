const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../config/auth");

//MODELS
const User = require("../../models/user");
const Token = require("../../models/token");

//PUSH NOTIFICATIONS
const push = require("../../config/notifications");

//NOTIFICATION API

router.get("/add/:token", async (req, res) => {
  const deviceToken = req.params.token;
  console.log(deviceToken);
  const newToken = new Token({
    deviceToken,
  });
  await newToken.save();
});

router.get("/user/:token", authenticateToken, async (req, res) => {
  //const token = await Token.find({ deviceToken: req.params.token });
  //console.log(token);
  if (req.params.token) {
    const user = await User.findById(req.user.id);
    const repeated = false;
    user.devices.forEach((device) => {
      if (req.params.token.equals(device)) {
        repeated = true;
      }
    });
    if (!repeated) {
      user.devices.push(req.params.token);
      user.save();
    }
  }
});

module.exports = router;
