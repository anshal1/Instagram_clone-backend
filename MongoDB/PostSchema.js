const mongoose = require("mongoose")
const {Schema} = mongoose


const Posts = new Schema({
    image: {
        type: String,
        required: true
    },
    caption:{
        type: String,
    },
    hashtags:{
        type: String
    },
    likes: [{type: String}],
    comments: [{username: String, comment: String, user_id: String, profile: String}],
    user_id: String,
    username: String,
    user_profile: String,
    current_date: {
        type: Date,
        default: Date.now
    },
    saved: [{type:String}],
    post_id: String
})

const Feed = mongoose.model("Posts", Posts)
module.exports = Feed

