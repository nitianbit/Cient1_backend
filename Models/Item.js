const mongoose = require('mongoose')

const Schema = mongoose.Schema

const itemSchema = new Schema({
    Name: {type:String, require:true},
    Desc: {type:String, require:true},
    Img: [{type:String, require:true}],
    Rating: {type:String},
    Price: {type: Number, default:0 }
},{timestamps: true})

const item = mongoose.model('Item',itemSchema)
module.exports = item