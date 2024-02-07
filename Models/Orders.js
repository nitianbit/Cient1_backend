const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const ordersSchema = new Schema({
    UserId: {type:String},
    ItemId: [{type:String}],  
    Status: [{type:String}],  
    ItemCount: [{type:Number}],
}, {timestamps:true})

const orders = mongoose.model('Order',ordersSchema)

module.exports = orders