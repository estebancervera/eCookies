const jwt = require('jsonwebtoken');
const User = require('../models/user')

module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/business/login');
    },

    authenticateToken:(req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if(token == null) return res.sendStatus(401);

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{
            if(err) return res.sendStatus(403);

            req.user = user ;

            next()
        });
    },

    authenticateEmailUser:(req, res, next) => {
        
        const token = req.params.token;
        if(token == null) return res.sendStatus(401);
        
        jwt.verify(token, process.env.SIGNUP_TOKEN_SECRET, (err, user) =>{
            if(err) return res.sendStatus(403);
            
          req.user = user
            
            next()
        });
    },
     requireAdmin : (req, res, next) => {
        if (req.user.accessLevel ==='admin') {
          next();
        } else {    
          res.redirect('/business/dashboard');
        }
    }
    
}