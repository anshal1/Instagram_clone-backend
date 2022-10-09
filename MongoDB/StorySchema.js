const mongoose = require("mongoose")
const {Schema} = mongoose


const Story = new Schema({
    story: {
        type: String,
        require: true
    },
    user_id: String,
    poster: String,
    date: {
        type: Date,
        default: Date.now
    }

})

const User_story = mongoose.model("stories", Story)
module.exports = User_story