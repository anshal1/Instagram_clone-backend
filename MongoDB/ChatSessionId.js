const mongoose = require("mongoose")
const {Schema} = mongoose

const ChatID = new Schema({
    user:{
        type: Array
    }
})

const Id = mongoose.model("ChatID", ChatID)
module.exports = Id