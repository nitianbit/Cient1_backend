const express = require('express')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const ws = new WebSocket('ws://localhost:8080');

const Users = require('../Models/Users')
const Address = require('../Models/Address')
const Orders = require("../Models/Orders")
const Payment = require("../Models/Payment")
const Item = require("../Models/Item")
const Carts = require("../Models/Carts")
const Delivery = require("../Models/Delivery")


const Router = express.Router()
const saltRounds = 10

Router

.post('/signup', async (req, res)=> { 
    req = req.body

    const Username = req.Username
    const Email = req.Email
    let Password = req.Password

    // Hashing Password
    Password = bcrypt.hash(Password, saltRounds)

    const obj ={
        Username,
        Email,
        Password
    }

    try {
    const user = new Users(obj);
    user.save();
    res.send("User Added!!")
    } catch(err)
    {
        console.log("Error on Signup: ", err)
    }
})

.post('/login', async (req, res)=> {
    req = req.body

    const Email = req.Email
    let Password = req.Password

    // Hashing Password
    const hashPass = bcrypt.hash(Password, saltRounds)

    const user = await Users.find({Email,Password})

    if(user.Password == hashPass){
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = {
            Email
        }
     
        const token = jwt.sign(data, jwtSecretKey);
        res.json(token)
    }
    else
        res.json(0)
})

.get('/get_addr', async(req, res)=> {
    req = req.body

    const Email = req.Email
    //Get User
    const user = await Users.find({Email})
    const addr = Address.find({UserId: user._id})
    return res.json(Address)
})

.post('/add_addr', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const AddrType = req.AddrType
    const AddrString = req.AddrString

    //Get User
    const user = await Users.find({Email})

    const addr = await Address.find({UserId: user._id})

    if(addr.length == 0)
    {
        const newAddr = new Address({})
        newAddr.save()
    }
    try {
        addr = addr[0]
        for(let i =0; i<addr.length; i++)
        {
            if(addr.AddrType[i] == AddrType)
            res.json(3)
        }
        await Address.updateOne({UserId: user._id}, { $push: { AddrType, AddrString } })
        res.json(1)

    }
    catch (err) { 
        res.json(0)
    }
})

.post('/update_addr', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const OldAddrType = req.OldAddrType
    const AddrType = req.AddrType
    const OldAddrString = req.OldAddrString
    const AddrString = req.AddrString
    //Get User
    const user = await Users.find({Email})

    const addr = await Address.find({UserId: user._id})

    if(addr.length == 0)
    {
        res.json(2)
    }
    try {
        addr = addr[0]
        for(let i =0; i<addr.AddrType.length; i++)
        {
            if(addr.AddrType[i] == OldAddrType && addr.AddrString[i] == OldAddrString)
            {
                addr.AddrType[i] = AddrType
                addr.AddrString[i] = AddrString
                break;
            }
        }
        await Address.updateOne({UserId: user._id}, { $set: { AddrType: addr.AddrType, AddrString: addr.AddrString } })
        res.json(1)

    }
    catch (err) { 
        res.json(0)
    }

})

.post('/delete_addr', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const OldAddrType = req.OldAddrType
    const AddrType = req.AddrType
    const OldAddrString = req.OldAddrString
    const AddrString = req.AddrString
    //Get User
    const user = await Users.find({Email})

    const addr = await Address.find({UserId: user._id})

    if(addr.length == 0)
    {
        res.json(2)
    }
    try {
        addr = addr[0]
        for(let i =0; i<addr.AddrType.length; i++)
        {
            if(addr.AddrType[i] == OldAddrType && addr.AddrString[i] == OldAddrString)
            {
                addr.AddrType.splice(i,1)
                addr.AddrString.splice(i,1)
                break;
            }
        }
        await Address.updateOne({UserId: user._id}, { $set: { AddrType: addr.AddrType, AddrString: addr.AddrString } })
        res.json(1)

    }
    catch (err) { 
        res.json(0)
    }


})

.get('/get_order', async(req, res)=> {
    req = req.body

    const Email = req.Email
    //Get User
    const user = await Users.find({Email})

    // PreProcessing of data
    const order = await Orders.find({UserId: user._id})
    let Items = []
    order.ItemId.map(async(el)=>{
        const item = await Item.find({_id:el})
        Items.push(item)
    })

    const obj = {
        Username: user.Username,
        Useremail: user.Email,
        Items,
        Status: order.Status,
        ItemCount: order.ItemCount
    }
    res.json(obj)

})

.get("/get_order/:id", async (req, res)=> {
    return await Orders.find({_id:req.params.id})
})
.post('/add_order', async (req, res)=> {
    req = req.body

    const Email = req.Email
    const userItems = req.Items
    //Get User
    const user = await Users.find({Email})
    

    const order = await Orders.find({UserId: user._id})
    if(order.length == 0)
    {
        const order = new Orders({UserId: user._id})
        order.save()
    }
    try
    {
        let ItemIds = []
        userItems.map( async (el)=>{
            const item = await Item.find({Name: el.Name, Desc: el.Desc, Img:el.Img})
            ItemIds.push(item._id)
        })
        const count = userItems.length

        await Orders.updateOne({UserId: user._id}, { $push: { ItemId:{ $each:ItemIds} , Status:"Pending", ItemCount:count} })
        const sor = {
            Email,
            userItems
        }
        ws.send(JSON.stringify(sor));
        res.json(1)
    }
    catch(err)
    {
        console.log("Error is: ", err)
        res.json(0)
    }
})

.post('/update_status_order', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const status = req.status
    const index = req.index
    //Get User
    const user = await Users.find({Email})

    const order = await Orders.find({UserId: user._id})
    try{
    let statusArr = order.Status[index]
    statusArr[index] = status
    await Orders.updateOne({UserId: user._id}, {$push: {Status:statusArr}})
    
    }
    catch(err)
    {
        console.log("Error is: ", err)
        res.json(0)
    }
    if(status == 'Confirm')
    {
        try{
            const delivery = await Delivery.find({UserId:user._id})
            if(delivery.length == 0)
            {
                const no = await Delivery({UserId:user._id})
                no.save()
            }
            
            Delivery.updateOne({UserId: user._id},{$push:{OrderId:order._id, Status:status}})
            res.json(1)
        }
        catch(err)
        {
            console.log("Error is: ",err)
            res.json(0)
        }
    }
    else
    res.json(1)
})

.get('/get_cart', async(req, res)=> {
    req = req.body

    const Email = req.Email
    //Get User
    const user = await Users.find({Email})
    
     
    const cart = await Carts.find({UserId:user._id})
    if(cart.length == 0)
    res.json(2)
    try{
        let items = []
        cart.ItemId.map(async(el)=>{
            const item = await Item.find({_id:el})
            items.push(item)
        })
        const obj={
            items,
            Status: cart.Status
        }
    }
    catch(err)
    {
        console.log("Error is: ",err);
        res.json(0)
    }

})

.post('/add_cart', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const userItems = req.Items
    const status = req.Status
    //Get User
    const user = await Users.find({Email})
    const cart = await Carts.find({UserId: user._id})
    if(cart.length == 0)
    {
        const cart = new Carts({UserId: user._id})
        cart.save()
    }
    try
    {
        let ItemIds = []
        userItems.map( async (el)=>{
            const item = await Item.find({Name: el.Name, Desc: el.Desc, Img:el.Img})
            ItemIds.push(item._id)
        })
        
        await Carts.updateOne({UserId: user._id}, { $push: { ItemId:{ $each:ItemIds} , Status: {$each:status}} })
        res.json(1)
    }
    catch(err)
    {
        console.log("Error is: ", err)
        res.json(0)
    }
})

.post('/delete_cart', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const index = req.index
    //Get User
    const user = await Users.find({Email})
    const cart = await Carts.find({UserId:user._id})

    let itemId = cart.ItemId
    let statuscart = cart.Status
    itemId.splice(index,1)
    statuscart.splice(index,1)
    try
    {
        await Carts.updateOne({UserID:user._id},{$push:{ItemId:itemId, Status:statuscart}})
        res.json(1)
    }
    catch(err)
    {
        console.log("Error is: ", err)
        res.json(0)
    }
})

module.exports = Router