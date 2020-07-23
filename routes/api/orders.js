const express  = require('express');
const router = express.Router();
const {authenticateToken } = require('../../config/auth')

const Order = require('../../models/order');
const User = require('../../models/user');

//PRODUCTS API

router.get("/orders", authenticateToken,(req, res) => {
    console.log(req.user);
    User.findById(req.user.id)
    .then(user => {
        if(!user){
            console.log(user);
            res.json({message: 'Token invalid, no User with that token'});
        }else{
            res.json(user.orders);
        }

       
    })
    .catch(err => console.log(err));

});


router.post("/orders", authenticateToken,(req, res) => {
    //console.log(req.user);
   // console.log(req.body);
   // console.log(req.body.packets[0]);
   // console.log(req.body.packets[1]);
   // console.log(req.body.packets[0].cookies);
   // console.log(req.body.packets[1].cookies);
    
    User.findOneAndUpdate({_id: req.user.id}, {$push: {orders: req.body}}, (err, result) =>{
        if(err){
            res.json({message: "failed to add order"})
        }else{
            res.json({message: "order added successfully"})
        }
    })

});


module.exports = router;

