const mongoose = require('mongoose')

const Schema = mongoose.Schema

const cartSchema = new Schema({
    UserId: { type:String },
    ItemId: [{ type:String }],
    Status: [{ type:Boolean }],

},{timestamps: true})

const cart = mongoose.model('Cart',cartSchema)
module.exports = cart