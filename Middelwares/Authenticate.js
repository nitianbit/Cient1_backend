const express = require("express")
const jwt = require('jsonwebtoken');

const Router = express.Router()

Router.post("/", (req,res)=> {
    let tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
 
    try {
        const token = req.header(tokenHeaderKey);
 
        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
           req.body.Email = verified.Email
           next()
        } else {
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
})