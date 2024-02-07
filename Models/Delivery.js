const mongoose = require('mongoose')

const Schema = mongoose.Schema

const deliverySchema = new Schema({
    UserId: {type:String, require:true},
    OrderId: [{type: String, require:true}],
    Status: [{type: String, require:true}]
},{timestamps:true})

const delivery = mongoose.model('Delivery',deliverySchema)

module.exports = delivery