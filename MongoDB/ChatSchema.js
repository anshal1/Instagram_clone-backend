const mongoose = require("mongoose")
const {Schema} = mongoose

const Chat = new Schema({
    text:{
        type: String,
    },
    user:{
        type:String
    },
    friend:{
        type: String
    },
    sender:{
        type: String
    }, 
    chat_id:{
        type: String
    },
    profile: {
        type: String
    },
    sender_name:{
        type: String
    },
    receiver_name:{
        type: String
    },
    date:{
        type: Date,
        default: Date.now
    }


})

const Chatschema = mongoose.model("Chats", Chat)
module.exports = Chatschema