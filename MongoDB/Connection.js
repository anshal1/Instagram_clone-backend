const mongoose = require("mongoose")
require("dotenv").config()
const URI = process.env.mongo

const Connect =()=>{
    try {
        mongoose.connect(URI, ()=>{
            console.log("Connected")
        })
    } catch (error) {
        if(error){
            return res.status(500).json({error: "Connection Timeout", success: false})
        }
    }
}
module.exports = Connect