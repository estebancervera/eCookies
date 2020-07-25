const express  = require('express');
const router = express.Router();
const {authenticateToken } = require('../../config/auth')

const Order = require('../../models/order');
const User = require('../../models/user');

//PRODUCTS API

router.get("/orders", authenticateToken,(req, res) => {
    console.log(req.user);
    Order.find({user: req.user.id})
    .then(orders => {
        if(!orders){
            console.log(user);
            res.json({message: 'Token invalid, no User with that token'});
        }else{
            res.json(orders);
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
   const order = new Order({
       user: req.user.id,
       packets: req.body.packets,
       deliveryDate: req.body.deliveryDate * 1000
   });

   Order.create(order, (err, order) => {
        if (err){
            res.json({message: "failed to create order"});
            console.log(err);
        }
        else{
        User.findOneAndUpdate({_id: req.user.id}, {$push: {orders: order}}, (err, result) =>{
            if(err){
                res.json({message: "failed to add order"})
            }else{
                res.json({message: "order added successfully"})
            }
        });
    }

   });
    
   

});


module.exports = router;

