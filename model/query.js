const mongoose = require('mongoose')
const Schema = mongoose.Schema
// const passportLocalMongoose = require('passport-local-mongoose');
const Query = new Schema({
    name:{
        type:String
    },
    email:{
        type:String,
    },
    message:{
        type:String
    },
   
})

  
module.exports = mongoose.model('Query', Query);