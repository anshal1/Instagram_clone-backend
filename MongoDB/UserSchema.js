const mongoose = require("mongoose")
const { Schema } = mongoose

const User = new Schema({
    name:
        { type: String, required: true },
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    User_index: Number,
    follower: [{ type: String }],
    following: [{ type: String }],
    gender: String,
    bio:{
        type: String
    },
    profile: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHL03nqSptOCTMXb8ym6QffVTfjk2C14HS-w&usqp=CAU"
    },
    link: String,
    verified: {
        type: String,
        default: "No"
    },
    saved:[{ type: Object}],
    like_messages: [{liker: String, liker_id: String, post_id: String, profile: String, date: String}],
    comment_messages: [{commentor: String, commentor_id: String, post_id: String, profile: String, date:String}],
    follow_messages: [{follower: String, follower_id: String, profile: String, date:String}],
    post_id: String
})

const NewUsers = mongoose.model("Users", User)
module.exports = NewUsers