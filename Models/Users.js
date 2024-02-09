const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const usersSchema = new Schema ({
    Username: {type:String, require:true},
    Email: {type: String, require:true},
    Password: {type:String, require:true},
    OrdersId: [{type:String}],
    AddressId: [{type:String}],
    CartId: [{type:String}],
    PaymentId: [{type:String}],
    DeliveryId: [{type:String}],
    Type:{type:String}
},{timestamps: true})

const users = mongoose.model('User', usersSchema)

module.exports = users