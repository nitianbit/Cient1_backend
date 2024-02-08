const express = require("express")
const jwt = require('jsonwebtoken');
const Users = require("../Models/Users")

 

 const auth = async (req,res, next)=> {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
 
    try {
        const token = req.cookies.jwtoken   
        
        if(token == undefined) res.send("Please Login First!!")
        const verified =  jwt.verify(token, jwtSecretKey);
        const email = verified.Email
        const user = await Users.find({Email})
        if (user) {
           req.body.Email = verified.Email
          next()
        } else {
            // Access Denied
            
            return res.status(401).send("error");
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
}
module.exports = auth