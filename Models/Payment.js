const mongoose = require('mongoose')

const Schema = mongoose.Schema

const paymentSchema = new Schema({
    UserId: {type: String, require:true},
    QRImage: [{type:String, require:true}],
    OrderId: [{type:String, require:true}],
    Status: [{type:Boolean,require:true}]
},{timestamps: true})

const payment = mongoose.model('Payment', paymentSchema)
module.exports = payment