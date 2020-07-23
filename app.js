require('dotenv').config()

const express 			= require("express");
const mongoose 			= require('mongoose');
const methodOverride 	= require("method-override");
const expressSanitizer 	= require('express-sanitizer');
const passport 			= require('passport');
const session 			= require('express-session');

const	app 			= express();

require('./config/passport')(passport);
	 
// DB config

const db  = require('./config/keys').MongoURI

// CONNECT TO MONGO

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then( () => console.log("Connected to MongoDB"))
.catch(err => console.log(err));


//EJS

app.set("view engine", "ejs");
app.use(express.static("public"));

//BodyParser

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Express Session

app.use(session({
	secret: "eCookies las mejores galletas",
	resave: true,
	saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//METHOD OVERIDE
app.use(methodOverride("_method"));


// ROUTES

app.use('/products', require('./routes/products'));
app.use('/users', require('./routes/users'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api/orders'));
app.use('/api', require('./routes/api/products'));

app.use('/', require('./routes/index'));


const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));