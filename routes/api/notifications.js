const express = require("express");
const router = express.Router();
const { authenticateToken, authenticateTokenManager } = require("../../config/auth");

//MODELS
const User = require("../../models/user");
const Token = require("../../models/token");
const Manager = require("../../models/manager");

//PUSH NOTIFICATIONS
const push = require("../../config/notifications");

//NOTIFICATION API

router.post("/add/", async (req, res) => {
  console.log(req.body);
  const deviceToken = req.body.token;
  console.log(deviceToken);
  const newToken = new Token({
    deviceToken,
  });
  await newToken.save();
});

router.post("/user/", authenticateToken, async (req, res) => {
  //const token = await Token.find({ deviceToken: req.params.token });
  //console.log(token);
  console.log(req.body);
  const deviceToken = req.body.token;
  if (deviceToken) {
    const user = await User.findById(req.user.id);
    var repeated = false;
    user.devices.forEach((device) => {
      if (deviceToken === device) {
        repeated = true;
      }
    });
    if (!repeated) {
      user.devices.push(deviceToken);
      user.save();
    }
  }
});

router.post("/manager/", authenticateTokenManager, async (req, res) => {
  //const token = await Token.find({ deviceToken: req.params.token });
  //console.log(token);
  console.log(req.body);
  const deviceToken = req.body.token;
  if (deviceToken) {
    const manager = await Manager.findById(req.manager.id);
    var repeated = false;
    manager.devices.forEach((device) => {
      if (deviceToken === device) {
        repeated = true;
      }
    });
    if (!repeated) {
      manager.devices.push(deviceToken);
      manager.save();
    }
  }
});

module.exports = router;
