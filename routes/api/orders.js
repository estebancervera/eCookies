const express  = require('express');
const router = express.Router();
const {authenticateToken } = require('../../config/auth')

const Order = require('../../models/order');
const User = require('../../models/user');

//PRODUCTS API

router.get("/orders", authenticateToken,(req, res) => {
    console.log(req.user);
    Order.find({user: req.user.id}).populate("business")
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




   const order = new Order({
       user: req.user.id,
       packets: req.body.packets,
       deliveryDate: req.body.deliveryDate * 1000,
       business: req.body.business

   });

   User.findById(req.user.id, (err, user)=>{
    if(err){
        res.json({isError: true, message: "No se pudo crear la orden."});
        console.log(err);
    }else{
        if(user.banned){
            res.json({isError: true, message: "Tu cuenta ha sido reportada por un negocio por no recoger un pedido. No podra hacer ninguna nueva orden. Contacte al negocio para más información."});
        }else{
            Order.create(order, (err, order) => {
                if (err){
                    res.json({isError: true, message: "No se pudo crear la orden."});
                    console.log(err);
                }
                else{
                User.findOneAndUpdate({_id: req.user.id}, {$push: {orders: order}}).exec((err, result) =>{
                    if(err){
                        res.json({isError: true, message: "Hubo un error con la orden"})
                    }else{
                        res.json({isError: false, message: "Orden agregada exitosamente!"})
                    }
                });
            }
        
           });
        }
    }

   });


    
   

});


module.exports = router;

