const express = require("express")
const Fetchuser = require("../Getuser")
const Chatschema = require("../MongoDB/ChatSchema")
const Id = require("../MongoDB/ChatSessionId")
const NewUsers = require("../MongoDB/UserSchema")
const router = express.Router()

// ? create a route to add the Chat
router.post("/chat/save", Fetchuser, async (req, res) => {
    try {
        const { text, friend } = req.body
        if (!text) {
            return res.status(400).json({ error: "Message cannot be empty" })
        }
        if (!friend) {
            return res.status(400).json({ error: "Friend Did not exists" })
        }
        const find_friend = await NewUsers.findById(friend)
        if(!find_friend){
            return res.status(404).json({error: "User not found"})
        }
        const currentID = current_user._id.toString()
        const find_if_ChatID_exists = await Id.findOne({ $in: { currentID , friend} })
        if (!find_if_ChatID_exists) {
            const create_Chat_id = await Id.create({
                user: [currentID, friend]
            })
            const create_chat = await Chatschema.create({
                text,
                friend,
                user: current_user._id,
                sender: current_user._id,
                chat_id: create_Chat_id._id,
                profile: current_user.profile,
                sender_name: current_user.username,
                receiver_name: find_friend.username
            })
            return res.json({ create_Chat_id, create_chat, msg: "This is new created" })
        }
        else if (find_if_ChatID_exists) {
            const create_chat = await Chatschema.create({
                text,
                friend: friend,
                user: current_user._id,
                sender: current_user._id,
                chat_id: find_if_ChatID_exists._id,
                profile: current_user.profile,
                sender_name: current_user.username,
                receiver_name: find_friend.username
            })
            return res.json({ create_chat, msg: "Chat id for this message already exists" })
        }
    } catch (err) {
        res.json(err)
    }
})
router.post("/all/chat", Fetchuser, async (req, res) => {
    const { friend } = req.body
    if (!friend) {
        return res.status(400).json({ error: "Friend Did not exists" })
    }
    const currentID = current_user._id.toString()
    const find_if_ChatID_exists = await Id.findOne({ $in: { currentID , friend} })
    const find_chats = await Chatschema.find({chat_id: find_if_ChatID_exists._id})
    if(!find_chats || find_chats < 1){
        return res.json({msg: "No Chats"})
    }
    res.json({find_chats})
})
router.delete("/delete/chat/:id", Fetchuser, async(req, res)=>{
    let find_chat = await Chatschema.findById(req.params.id)
    if(!find_chat){
        return res.status(404).json({error: "Chat unavailable"})
    }
    if(find_chat.sender !== current_user._id.toString()){
        return res.status(401).json({error: "Unauthorized action"})
    }
    find_chat = await Chatschema.findByIdAndDelete(req.params.id)
    res.json({msg: "Message deleted"})
})

module.exports = router