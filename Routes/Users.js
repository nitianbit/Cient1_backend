const express = require('express')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
var crypto = require('crypto'); 
//const WebSocket = require('ws');
//const ws = new WebSocket('ws://localhost:443/');

const Users = require('../Models/Users')
const Address = require('../Models/Address')
const Orders = require("../Models/Orders")
const Payment = require("../Models/Payment")
const Item = require("../Models/Item")
const Carts = require("../Models/Carts")
const Delivery = require("../Models/Delivery")


const Router = express.Router()
const salt  = process.env.SALT
 
Router

.post('/signup', async (req, res)=> { 
    req = req.body

    const Username = req.Username
    const Email = req.Email
    let password = req.Password
     
    console.log(Username, Email, password)
    if(!Username || !Email || !password )
    {return  res.json(3)
         }
    const checkUser = await Users.find({Email})
     
    if(checkUser.length != 0) { 
       return res.json(4)
         
    }
    // Hashing Password
   const Password =  crypto.pbkdf2Sync(password,  salt,  
        1000, 64, `sha512`).toString(`hex`);

    const obj ={
        Username,
        Email,
        Password,
        Type: "User"
    }

    try {
    const user = new Users(obj);
    user.save();
    res.send("User Added!!")
    } catch(err)
    {
        console.log("Error on Signup: ", err)
      return  res.json(0)
        
    }
})

.post('/login', async (req, res)=> {
    req = req.body

    const Email = req.Email
    let Password = req.Password

    if(!Email || !Password)
    return res.json(3)
    // Hashing Password
    const hashPass = crypto.pbkdf2Sync(Password,  
         salt, 1000, 64, `sha512`).toString(`hex`); 

    const user = await Users.find({Email})
    console.log(user[0].Password)
    console.log("Password is: ",hashPass)
    if(user[0].Password == hashPass){
        console.log("Come")
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        let data = user
     
        jwt.sign(data, jwtSecretKey, { expiresIn: "30d" }, (err, token) => {
            if(err){
              return res.status(400).send("Error occured while signing");
            }
        
            res.cookie("jwtoken", token, {
              expires: new Date(Date.now()+25892000000),
              httpOnly: true,
              secure: false,
            }).json({
              token: token,
              user: user,
              message: "success",
            })
          })
      
    }
    else
        return res.json(0)
})


.get('/get_addr', async(req, res)=> {
    req = req.body

    const Email = req.Email
    if(!Email) return res.json(3)
    //Get User
    const user = await Users.find({Email})
    if(user.length == 0)return res.json(2)
    const addr = Address.find({UserId: user[0]._id})
    return  res.json(addr)
})

.get('/get_addr/:id', async(req, res)=> {
    return await Address.find({UserId:req.params.id})
 }) 

.post('/add_addr', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const AddrType = req.AddrType
    const AddrString = req.AddrString

    if(!Email || !AddrType || !AddrString) return res.json(3)
    //Get User
    const user = await Users.find({Email})
    if(user.length == 0)return res.json(2)

    let addr = await Address.find({UserId: user[0]._id})

    if(addr.length == 0)
    {
        const newAddr = new Address({UserId: user[0]._id})
        newAddr.save()
        console.log(newAddr._id)
        
        await Users.updateOne({_id:user[0]._id},{$push: { AddressId:newAddr._id}} )
    }
    try {
         addr = addr[0]
        for(let i =0; i<addr?.AddrType.length; i++)
        {
            if(addr.AddrType[i] == AddrType)
            return res.json(5)
        }
     const usr =   await Address.updateOne({UserId: user[0]._id}, { $push: { AddrType, AddrString } })
    if(usr.acknowledged)
    return res.json(1)

    }
    catch (err) { 
        console.log("Error is: ",err)
        return res.json(0)
    }
})

.post('/update_addr', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const OldAddrType = req.OldAddrType
    const AddrType = req.AddrType
    const OldAddrString = req.OldAddrString
    const AddrString = req.AddrString

    if(!Email || !OldAddrString || !AddrString || !AddrType || !OldAddrType) return res.json(3)
    //Get User
    const user = await Users.find({Email})
    if(user.length == 0)return res.json(2)

    let addr = await Address.find({UserId: user[0]._id})

    if(addr.length == 0)
    {
        return res.json(2)
    }
    try {
        addr = addr[0]
        let i =0
        for( i =0; i<addr.AddrType.length; i++)
        {
            if(addr.AddrType[i] == OldAddrType && addr.AddrString[i] == OldAddrString)
            {
                addr.AddrType[i] = AddrType
                addr.AddrString[i] = AddrString
                break;
            }
        }
        if(i == addr.AddrType.length ) return res.json(6)
        await Address.updateOne({UserId: user[0]._id}, { $set: { AddrType: addr.AddrType, AddrString: addr.AddrString } })
        return res.json(1)

    }
    catch (err) { 
        console.log("Error is: ",err)
        return res.json(0)
    }

})

.post('/delete_addr', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const OldAddrType = req.AddrType
    
    const OldAddrString = req.AddrString
    if(!Email || !OldAddrString   ||  !OldAddrType) return res.json(3)
    //Get User
    const user = await Users.find({Email})
    if(user.length == 0)return res.json(2)
    let addr = await Address.find({UserId: user[0]._id})

    if(addr.length == 0)
    {
        return res.json(2)
    }
    try {
        addr = addr[0]
        let i =0
        for( i =0; i<addr.AddrType.length; i++)
        {
            if(addr.AddrType[i] == OldAddrType && addr.AddrString[i] == OldAddrString)
            {
                addr.AddrType.splice(i,1)
                addr.AddrString.splice(i,1)
                break;
            }
        }
        if(i == addr.AddrType.length+1 ) return res.json(6)
        await Address.updateOne({UserId: user[0]._id}, { $set: { AddrType: addr.AddrType, AddrString: addr.AddrString } })
        return res.json(1)

    }
    catch (err) { 
        console.log("Error is: ",err)
        return res.json(0)
    }


})

.get('/get_order', async(req, res)=> {
    req = req.body

    const Email = req.Email
    if(!Email)return res.json(3)
    //Get User
    const user = await Users.find({Email})
    if(user.length == 0)return res.json(2)
    // PreProcessing of data
    const order = await Orders.find({UserId: user[0]._id})
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
    return res.json(obj)

})

.get("/get_order/:id", async (req, res)=> {
    return await Orders.find({_id:req.params.id})
})
.post('/add_order', async (req, res)=> {
    req = req.body
     
    const Email = req.Email
    const userItems = req.Items
   
    console.log(userItems[0])
    if(!Email || !userItems) return res.json(3)
    //Get User
    const user = await Users.find({Email})
    if(user.length == 0)return res.json(2)

    const order = await Orders.find({UserId: user[0]._id})
    if(order.length == 0)
    {
        const newOrder = new Orders({UserId: user[0]._id,ItemId:[],Status:[],ItemCount:[]})
        newOrder.save()
         
        await Users.updateOne({_id:user[0]._id},{$push: { OrdersId:newOrder._id}})
    }
    try
    {
         
       let promise =    userItems?.map( async (el)=>{
            if(el?.Name == undefined)return res.json(6)
            const item = await Item.find({Name: el.Name})
        console.log(item)
            if (item.length !=0)
            return item[0]._id
            else return res.json(6)
        })
        const count = userItems.length
        Promise.all(promise).then(async(ItemIds)=>{
            console.log(ItemIds)
            const or =  await Orders.updateOne({UserId: user[0]._id}, { $push: { ItemId:{ $each:ItemIds} , Status:"Pending", ItemCount:count} })
            if(or.acknowledged)
        return res.json(1)
        }).catch((err)=> {
            console.log("Errori s: ",err)
            return res.json(0)
        })
        const sor = {
            Email,
            userItems
        }
       // ws.send(JSON.stringify(sor));
       
    }
    catch(err)
    {
        console.log("Error is: ", err)
        return res.json(0)
    }
})

.post('/update_status_order', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const status = req.status
    const index = req.index

    if(!Email || !status || !index) return res.json(3)
    //Get User
console.log(Email)
    const user = await Users.find({Email})
    if(user.length == 0) return res.json(2)
    console.log(user)
    let order = await Orders.find({UserId: user[0]._id})
    order = order[0]
    console.log(order)
    try{
    let statusArr = order.Status 
    statusArr[index - 1] = status
    console.log(order.Status)
    console.log(statusArr)
    console.log(index - 1)
    await Orders.updateOne({UserId: user[0]._id}, {$set:{Status:statusArr}})
    
    }
    catch(err)
    {
        console.log("Error is: ", err)
        return res.json(0)
    }
    if(status == 'Confirm')
    {
        try{
            console.log("Come")
            const delivery = await Delivery.find({UserId:user[0]._id})
            if(delivery.length == 0)
            {
                const no = await Delivery({UserId:user[0]._id})
                no.save()
             
                await Users.updateOne({_id:user[0]._id},{$push: { DeliveryId:no._id}})
            }
            
            await Delivery.updateOne({UserId: user[0]._id},{$push:{OrderId:order._id, Status:status}})
            return res.json(1)
        }
        catch(err)
        {
            console.log("Error is: ",err)
            return res.json(0)
        }
    }
    else
    return res.json(1)
})

.get('/get_cart', async(req, res)=> {
    req = req.body

    const Email = req.Email
    if(!Email) return res.json(3)
    //Get User
    const user = await Users.find({Email})
    
    if(user.length == 0)return res.json(2)
    const cart = await Carts.find({UserId:user[0]._id})
    if(cart.length == 0)
    return res.json(2)
    try{
        let items = []
      const promise =  cart.ItemId.map(async(el)=>{
            const item = await Item.find({_id:el})
            items.push(item)
        })
        Promise.all(promise)
        const obj={
            items,
            Status: cart.Status
        }
    }
    catch(err)
    {
        console.log("Error is: ",err);
        return res.json(0)
    }

})

.get("/get_cart/:id", async(req, res)=> {
    return await Carts.find({UserId:req.params.id})
})
.post('/add_cart', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const userItems = req.Items
    const status = req.Status

    if(!Email || !userItems || !status) return res.json(3)
    //Get User
    const user = await Users.find({Email})
    if(user.length == 0)return res.json(2)
    const cart = await Carts.find({UserId: user[0]._id})

    if(cart.length == 0)
    {
        const newCart = new Carts({UserId: user[0]._id})
        newCart.save()
        await Users.updateOne({_id:user[0]._id},{$push: { CartId:newCart._id}})
    }
    try
    {
    //     let ItemIds = []
    //    const promise =  userItems.map( async (el)=>{
    //         const item = await Item.find({Name: el.Name })
    //         if(item.length!=0)
    //         ItemIds.push(item[0]?._id)
    //         else return res.json(6)
    //     })
    //     Promise.all(promise).then(async()=>{
        const cartItem = await Item.find({Name:userItems.Name})
       const car = await Carts.updateOne({UserId: user[0]._id}, { $push: { ItemId:cartItem[0]._id , Status:  status} })
       if(car.acknowledged)
        return res.json(1)
    // }).catch((err)=> {
    //     console.log("Error is: ",err)
    //     return res.json(0)
    // })
    }
    catch(err)
    {
        console.log("Error is: ", err)
        return res.json(0)
    }
})

.post('/delete_cart', async(req, res)=> {
    req = req.body

    const Email = req.Email
    const index = req.index
    if(!Email || !index)return res.json(3)
    //Get User
    const user = await Users.find({Email})
    if(user.length == 0)return res.json(2)
    const cart = await Carts.find({UserId:user[0]._id})
    if(cart.length == 0)return res.json(3)
    let itemId = cart[0].ItemId
    let statuscart = cart[0].Status
    console.log(itemId)
    console.log(index)
    console.log(statuscart)
    itemId.splice(index,1)
    statuscart.splice(index,1)
    console.log(itemId)
    console .log(statuscart)
    try
    {
       const car = await Carts.updateOne({UserId:user[0]._id}, {$set:{ItemId:[], Status:[]}})
       console.log(car)
       if(car.acknowledged)
        return res.json(1)
    }
    catch(err)
    {
        console.log("Error is: ", err)
        return res.json(0)
    }
})

.get('/get_items', async (req, res)=> {
    return await Item.find({})
})

.get('/get_delivery_details', async(req, res)=> {
    req = req.body
    const Email = req.Email

    if(!Email) return res.json(3)
    const user = await User.find({Email})
    if(user.length == 0)return res.json(2)
    return await Delivery.find({UserId:user._id})
})
module.exports = Router