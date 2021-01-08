require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const passport = require("passport");
const session = require("express-session");
const app = express();
const flash = require("connect-flash");

require("./config/passport")(passport);

// DB config

const db = require("./config/keys").MongoURI;

// CONNECT TO MONGO
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

//EJS

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

//BodyParser

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Express Session

app.use(
  session({
    secret: "eCookies las mejores galletas",
    resave: true,
    saveUninitialized: true,
  })
);
//Notifications

//flash

app.use(flash());

//Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.edit_msg = req.flash("edit_msg");
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//METHOD OVERIDE
app.use(methodOverride("_method"));

// ROUTES
app.use("/businesses", require("./routes/businesses"));
app.use("/categories", require("./routes/categories"));
app.use("/products", require("./routes/products"));
app.use("/users", require("./routes/users"));
app.use("/orders", require("./routes/orders"));
app.use("/admin", require("./routes/admin"));
app.use("/api/token", require("./routes/api/notifications"));
app.use("/api/orders", require("./routes/api/orders"));
app.use("/api/business", require("./routes/api/products"));
app.use("/api/manager", require("./routes/api/managers"));

//ROUTES BUSINESS

app.use("/business", require("./routes/business/login"));
app.use("/business/mybusiness", require("./routes/business/business"));

app.use("/business/orders", require("./routes/business/orders"));
app.use("/business/categories", require("./routes/business/categories"));
app.use("/business/products", require("./routes/business/products"));

app.use("/business", require("./routes/business/index"));
app.use("/", require("./routes/index"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
