const PushNotifications = require("node-pushnotifications");

const settings = {
  apn: {
    token: {
      key: "./config/certs/key.p8", // optionally: fs.readFileSync('./certs/key.p8')
      keyId: "833D6F7468",
      teamId: "FTAL2BFN3H",
    },
    production: false, // true for APN production environment, false for APN sandbox environment,
  },
};

const push = new PushNotifications(settings);

module.exports = push;
