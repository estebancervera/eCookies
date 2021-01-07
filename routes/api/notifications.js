const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../config/auth");

//MODELS
const User = require("../../models/user");
const Token = require("../../models/token");

//PUSH NOTIFICATIONS
const push = require("../../config/notifications");

//NOTIFICATION API

router.get("/add/", async (req, res) => {
  const deviceToken = req.body.token;
  console.log(deviceToken);
  const newToken = new Token({
    deviceToken, 
  });
  await newToken.save();
});

router.get("/user/", authenticateToken, async (req, res) => {
  //const token = await Token.find({ deviceToken: req.params.token });
  //console.log(token);
  const deviceToken = req.body.token;
  if (deviceToken) {
    const user = await User.findById(req.user.id);
    const repeated = false;
    user.devices.forEach((device) => {
      if (deviceToken.equals(device)) {
        repeated = true;
      }
    });
    if (!repeated) {
      user.devices.push(deviceToken);
      user.save();
    }
  }
});

module.exports = router;
