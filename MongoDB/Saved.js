const mongoose = require("mongoose")
const {Schema} = mongoose

const saved_schema = new Schema({
    post: Object,
    user_id: String,
    post_id: String
})

const Saved = mongoose.model("saved", saved_schema)
module.exports = Saved