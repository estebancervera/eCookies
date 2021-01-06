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
  const token = await Token.find({ deviceToken: req.params.token });

  if (token) {
    const user = await User.findById(req.user.id);
    user.devices.push(token.id);
    await user.save();
  }
});

module.exports = router;




  