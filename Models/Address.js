const mongoose = require('mongoose')

const Schema = mongoose.Schema

const addressSchema = new Schema({
    UserId: {type: String},
    AddrType: [{type: String}],
    AddrString: [{type: String}],

}, {timestamps: true})

const address = mongoose.model('Address', addressSchema)

module.exports = address