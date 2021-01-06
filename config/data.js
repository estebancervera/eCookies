const data = {
  topic: "com.cerverae18.eCookies", // REQUIRED for iOS (apn and gcm)
  /* The topic of the notification. When using token-based authentication, specify the bundle ID of the app.
   * When using certificate-based authentication, the topic is usually your app's bundle ID.
   * More details can be found under https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
   */
  body: "Powered by eCookies",
  custom: {
    sender: "eCookies",
  },
  priority: "high", // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high'
  collapseKey: "", // gcm for android, used as collapseId in apn
  contentAvailable: true, // gcm, apn. node-apn will translate true to 1 as required by apn.
  clickAction: "", // gcm for android. In ios, category will be used if not supplied
  locKey: "", // gcm, apn
  locArgs: "", // gcm, apn
  titleLocKey: "", // gcm, apn
  titleLocArgs: "", // gcm, apn
  retries: 1, // gcm, apn
  encoding: "", // apn
  badge: 2, // gcm for ios, apn
  sound: "ping.aiff", // gcm, apn
  notificationCount: 0, // fcm for android. badge can be used for both fcm and apn
  alert: {
    // apn, will take precedence over title and body
    title: "token",
    body: "saved",
    // details: https://github.com/node-apn/node-apn/blob/master/doc/notification.markdown#convenience-setters
  },
  silent: false, // gcm, apn, will override badge, sound, alert and priority if set to true on iOS, will omit `notification` property and send as data-only on Android/GCM
  /*
   * A string is also accepted as a payload for alert
   * Your notification won't appear on ios if alert is empty object
   * If alert is an empty string the regular 'title' and 'body' will show in Notification
   */
  // alert: '',
  launchImage: "", // apn and gcm for ios
  action: "", // apn and gcm for ios
  category: "", // apn and gcm for ios
  // mdm: '', // apn and gcm for ios. Use this to send Mobile Device Management commands.
  // https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/3-MDM_Protocol/MDM_Protocol.html
  urlArgs: "", // apn and gcm for ios
  truncateAtWordEnd: true, // apn and gcm for ios
  mutableContent: 0, // apn
  threadId: "", // apn
  pushType: undefined, // apn. valid values are 'alert' and 'background' (https://github.com/parse-community/node-apn/blob/master/doc/notification.markdown#notificationpushtype)
  expiry: Math.floor(Date.now() / 1000) + 28 * 86400, // unit is seconds. if both expiry and timeToLive are given, expiry will take precedence
  timeToLive: 28 * 86400,
  consolidationKey: "my notification", // ADM
};

module.exports = function (title, message) {
  data.alert.title = title;
  data.alert.body = message;
  return data;
};
