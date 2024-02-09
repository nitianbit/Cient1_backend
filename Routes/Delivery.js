const express = require('express')

const User = require("../Models/Users")
const Delivery = require("../Models/Delivery")

const Router = express.Router()

.get('/get_delivery_details', async(req, res)=> {
    req = req.body
    const Email = req.Email

    if(!Email) return res.json(3)
    const user = await User.find({Email})
    if(user.length == 0)return res.json(2)
    return await Delivery.find({UserId:user._id})
})

.post('/update_delivery_details', async(req, res)=> {
    req = req.body

    const Email = req.Email 
    const status = req.Status
    const orderId = req.OrderId

    if(!Email || !status || !orderId)return res.json(3)
    const user = await User.find({Email})
    if(user.length == 0)return res.json(2)
    try
    { 
        await Delivery.updateOne({UserId:user._id, OrderId: orderId},{$push: {Status:status}})
        return res.json(1)
    }
    catch(err)
    {
        console.log("Error is: ",err)
        return res.json(0)
    }
})

module.exports = Router