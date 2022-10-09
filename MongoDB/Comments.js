const mongoose = require("mongoose")
const {Schema} = mongoose

const Comment = new Schema({
    username: String,
    comment:String,
    user_id: String,
    profile:String,
    post_id: String,
    post_owner: String
})

const CommentSchema = mongoose.model("comments", Comment)

module.exports = CommentSchema