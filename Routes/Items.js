const express = require('express')

const Router = express.Router()

const Item = require("../Models/Item")

Router

.get('/get_items', async (req, res)=> {
    return await Item.find({})
})

.get('/get_items/:id', async (req, res)=> {
    return await Item.find({_id:req.params.id})
})

.post('/add_items', (req, res)=> {
    req = req.body
    const Name = req.Name
    const Desc = req.Desc
    const Img = req.Img
    const Rating  =req.Rating
    const Price = req.Price

    if(!Name || !Price) res.send(2)
    const obj = 
        {
            Name, 
            Desc,
            Img,
            Rating,
            Price
        }

        try
        {
            const item = new Item(obj)
            item.save()
            res.json(1)
        }
        catch(err)
        {
            console.log("Error is: ",err)
            res.json(0)
        }
})

.post('/update_items', async(req, res)=> {
    const Name = req.Name
    const Desc = req.Desc
    const Img = req.Img
    const Rating  =req.Rating
    const Price = req.Price

    if(!Name || !Price) res.send(2)

    const item = await Item.find({Name})
    if(item.length == 0)res.json(2)
    try
    {
        await Item.updateOne({Name},{Desc,Img,Rating,Price})
        res.json(1)
    }
    catch(err)
    {
        console.log("Error is: ",err)
        res.json(0)
    }
})

.post('/delete_items', async(req, res)=> {
    const Name = req.Name
    

    if(!Name) res.send(2)
    await Item.deleteOne({Name})
})

module.exports = Router
