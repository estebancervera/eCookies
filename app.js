const product = require("./models/product");


var express 			= require("express"),
	app 				= express(),
	mongoose 			= require('mongoose');
	bodyParser 			= require("body-parser"),
 	methodOverride 		= require("method-override"),
 	expressSanitizer 	= require("express-sanitizer"),
	passport 			= require("passport"),
	LocalStrategy 		= require("passport-local"),
	Admin 				= require("./models/admin"),
	Product 			= require("./models/product"),
	Packet 				= require("./models/packet"),
	Order 				= require("./models/order")

	 


	 
mongoose.connect('mongodb://localhost:27017/cookie_shop_test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
	useFindAndModify: false
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//PASSPORT CONFIGURATION

app.use(require("express-session")({
	secret: "eCookies las mejores galletas",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use( new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

//ROUTES

app.get("/", function(req, res){
	res.redirect("/login");
});

app.get("/dashboard", isLoggedIn, function(req, res){
	res.render("dashboard");
});

app.get("/orders", isLoggedIn, function(req, res){
	res.render("orders");
});


app.get("/products",isLoggedIn, function(req, res){
	Product.find({}, function(err, products){
	if(err){
		console.log("ERROR: F : " + err);
	}else{;
		//console.log(";successfull find");
		res.render("products", {products: products});
	};
});
	
});

app.get("/products/new",isLoggedIn, function(req, res){
	res.render("new");;
});	


//EDIT
	
app.get("/products/:id/edit",isLoggedIn, function(req, res){
	Product.findById(req.params.id, function(err, foundProduct){
					 if (err){
						 res.redirect("/products")
					 }else{
						 res.render("edit", {product: foundProduct});
					 }
			});
	
});

//CREATE

app.post("/products", isLoggedIn, function(req, res){
	
	var isAvailable = req.body.product.available;
	
	if(isAvailable === 'on'){
		req.body.product.available = true;
	}else{
		req.body.product.available = false;
	}
	
	req.body.product.description = req.sanitize(req.body.product.description);
	
	Product.create( req.body.product, function(err){
	if(err){
		console.log("ERROR: " + err);
		res.render("new");
	}else{
		res.redirect("/products")
	}
});

});

//UPDATE ROUTE

app.put("/products/:id", isLoggedIn, function(req, res){
	
	var isAvailable = req.body.product.available;
	
	if(isAvailable === 'on'){
		req.body.product.available = true;
	}else{
		req.body.product.available = false;
	}
	
	req.body.product.description = req.sanitize(req.body.product.description);
	
	Product.findByIdAndUpdate(req.params.id, req.body.product, function(err, updatedProduct){
		if(err){
			res.redirect("/products")
		}else{
			res.redirect("/products")
		}
	} );
	
});

//DELETE ROUTE


app.delete("/products/:id", isLoggedIn, function(req, res){
		Product.findByIdAndRemove(req.params.id, function(err){
			if(err){
				res.redirect("/products");
			}else{
				res.redirect("/products");
			}
		})
});
	

//=======================
//AUTH ROUTES

//show register form
/*
app.get("/register", funtion(req,res){

	res.render("register")
});

*/

// show login form
app.get("/login", function(req, res){

	res.render("login");
});

//handle login logic
app.post("/login",
passport.authenticate("local", {
	successRedirect: "/dashboard", 
	failureRedirect: "/login"}),
function(req, res){
});

//logout

app.get("/logout", isLoggedIn, function(req , res){
	req.logout();
	res.redirect("/login");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


//============================================

// APP ROUTES

//============================================

app.get("/products/json", function(req, res){

	Product.find({}, function(err, products){
		if(err){
			console.log("ERROR: F : " + err);
		}else{;
			//console.log(";successfull find");
			res.json(products);
		};
	});

});



app.get("*", function(req, res){
	res.redirect("/login");
});


app.listen(3000, function(){
	console.log("Server is running!");
});