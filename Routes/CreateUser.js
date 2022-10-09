const express = require("express")
const router = express.Router()
const { body, validationResult, Result } = require('express-validator');
const NewUsers = require("../MongoDB/UserSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Sc = "%$&^%&^*(*(&*(^&*$^@"
const multer = require("multer")
const Fetchuser = require("../Getuser");
const Feed = require("../MongoDB/PostSchema");
const CommentSchema = require("../MongoDB/Comments");
const User_story = require("../MongoDB/StorySchema");
const cloudinary = require("cloudinary")
const sharp = require("sharp")
const fs = require("fs");
const Chatschema = require("../MongoDB/ChatSchema");
const Id = require("../MongoDB/ChatSessionId");
require("dotenv").config()
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}`)
    }
})
const upload = multer({
    storage
})
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});
try {
    router.post("/signup", [body("name").exists(),
    body("username").exists(),
    body("email").isEmail(),
    body("password").exists()], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, username, email, password, gender, bio } = req.body
        const Find_User = await NewUsers.find({ username: username, email: email })
        if (Find_User) {
            return res.status(400).json({ error: "User already exists", success: false })
        }
        const salt = await bcrypt.genSalt(10)
        const hash = bcrypt.hashSync(password, salt)
        const alluser = await NewUsers.find()
        const User = await NewUsers.create({
            name: name,
            username: username,
            email: email,
            password: hash,
            User_index: alluser.length + 1,
            gender: gender,
            bio: bio,
        })
        const localtoken = jwt.sign({ userid: User._id }, Sc)
        res.json({ localtoken })
    })
    router.post("/login", [body("username"),
    body("password")
    ], async (req, res) => {
        try{
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { username, password } = req.body
            const Find_User = await NewUsers.findOne({ username: username })
            if (!Find_User) {
                return res.status(400).json({ error: "User does not exists", success: false })
            }
            const comparePassword = await bcrypt.compare(password, Find_User.password)
            if (!comparePassword) {
                return res.status(500).json({ error: "Incorrect password", success: false })
            } else {
                const localtoken = jwt.sign({ userid: Find_User._id }, Sc)
                res.json({ localtoken })
            }
        } catch(error){
            if(error){
                return res.status(500).json({error: "Something went wrong"})
            }
        }
    })

    router.post("/user/data", Fetchuser, async (req, res) => {
        res.json({ current_user })
    })
    router.post("/add/profile", Fetchuser, upload.single("profile"), async (req, res) => {
        const find_user = await NewUsers.findById(current_user._id)
        if (!find_user) {
            return res.status(400).json({ error: "User not found", success: false })
        }
        if (find_user._id.toString() !== current_user._id.toString()) {
            return res.status(400).json({ error: "Unauthorized action", success: false })
        }
        // * uploading to cloudinary
        if(req.file){
            await sharp(req.file.path).resize({ width: 120, height: 120 }).jpeg({ quality: 80 }).toFile("./upload/" + req.file.filename)
            cloudinary.v2.uploader.upload("upload/" + req.file.filename, { public_id: req.file.filename }).then(async (result) => {
                if (result) {
                    fs.unlinkSync("./upload/" + req.file.filename)
                    let update = await NewUsers.findByIdAndUpdate(current_user._id, { $set: { profile: result.url } }, { new: true })
                    let update2 = await NewUsers.findByIdAndUpdate(current_user._id, { $set: { post_id: req.file.filename } }, { new: true })
                    let update_post_image = await Feed.updateMany({ user_id: current_user._id }, { $set: { user_profile: result.url } }, { new: true })
                    let update_story_poster = await User_story.findOneAndUpdate({ user_id: find_user._id }, { $set: { poster: result.url } }, { new: true })
                    let find_comments = await CommentSchema.find({ user_id: current_user._id })
                    if (!find_comments) {
                        return null
                    } else {
                        find_comments = await CommentSchema.updateMany({ user_id: current_user._id }, { $set: { profile: result.url } }, { new: true })
                    }
                    res.send(result.url)
                    return 
                }
            }).catch((err) => {
                fs.unlinkSync("./upload/" + req.file.filename)
                return console.log(err)
            })
        }
    })
    router.put("/edit/profile", Fetchuser, upload.single("profile"), async (req, res) => {
        const find_user = await NewUsers.findById(current_user._id)
        if (!find_user) {
            return res.status(400).json({ error: "User not found", success: false })
        }
        if (find_user._id.toString() !== current_user._id.toString()) {
            return res.status(400).json({ error: "Unauthorized action", success: false })
        }
        if(req.file){
            await sharp(req.file.path).resize({ width: 120, height: 120 }).jpeg({ quality: 80 }).toFile("./upload/" + req.file.filename)
            cloudinary.v2.uploader.upload("upload/" + req.file.filename, { public_id: req.file.filename }).then(async (result) => {
                if (result) {
                    fs.unlinkSync("./upload/" + req.file.filename)
                    let update = await NewUsers.findByIdAndUpdate(current_user._id, { $set: { profile: result.url } }, { new: true })
                    let update2 = await NewUsers.findByIdAndUpdate(current_user._id, { $set: { post_id: req.file.filename } }, { new: true })
                    let update_post_image = await Feed.updateMany({ user_id: current_user._id }, { $set: { user_profile: result.url } }, { new: true })
                    let update_story_poster = await User_story.findOneAndUpdate({ user_id: find_user._id }, { $set: { poster: result.url } }, { new: true })
                    let find_comments = await CommentSchema.find({ user_id: current_user._id })
                    if (!find_comments) {
                        return null
                    } else {
                        find_comments = await CommentSchema.updateMany({ user_id: current_user._id }, { $set: { profile: result.url } }, { new: true })
                    }
                    res.send(result.url)
                    await cloudinary.v2.uploader.destroy(find_user.post_id).then((result) => {
                        return
                    }).catch((err) => {
                        return console.log(err)
                    })
                    return
                }
            }).catch((err) => {
                return console.log(err)
            })
        }
    })
    router.post("/edit", Fetchuser, async (req, res) => {
        const find_user = await NewUsers.findById(current_user._id)
        if (!find_user) {
            return res.status(400).json({ error: "User not found", success: false })
        }
        if (find_user._id.toString() !== current_user._id.toString()) {
            return res.status(400).json({ error: "Unauthorized action", success: false })
        }
        let newdata = {}
        const { name, username, email, bio, link } = req.body
        if (username !== find_user.username && username) {
            const find_if_exists = await NewUsers.findOne({ username })
            if (find_if_exists) {
                return res.status(400).json({ error: "Username already exists", success: "username" })
            }
        } else if (email !== find_user.email && email) {
            const find_if_exists = await NewUsers.findOne({ email })
            if (find_if_exists) {
                return res.status(400).json({ error: "Email already exists", success: "email" })
            }
        }
        if (name) { newdata.name = name }
        if (username) { newdata.username = username }
        if (email) { newdata.email = email }
        if (bio) { newdata.bio = bio }
        if (link) { newdata.link = link }

        const update = await NewUsers.findByIdAndUpdate(current_user._id, { $set: newdata }, { new: true })
        let update_post_username = await Feed.updateMany({ user_id: current_user._id }, { $set: { username: newdata.username } }, { new: true })
        res.json({ update })
    })
    router.post("/get/user", Fetchuser, async (req, res) => {
        const find_user = await NewUsers.findById(current_user._id).select("-password")
        if (!find_user) {
            return res.status(400).json({ error: "User not found", success: false })
        }
        res.json({ current_user: find_user })
    })
    router.get("/some/user", async (req, res) => {
        const user = await NewUsers.find({}).select("-password")
        if (!user) {
            return res.status(404).json({error: "User not found"})
        }
        res.json({ user })

    })
    router.post("/one/user/:id", async (req, res) => {
        const find_user = await NewUsers.findById(req.params.id)
        if (!find_user) {
            return res.status(400).json({ error: "User not found", success: false })
        }
        res.json({ find_user })
    })
    router.put("/follow/:id", Fetchuser, async (req, res) => {
        let find_user = await NewUsers.findById(req.params.id)
        let me = await NewUsers.findById(current_user._id)
        if (!req.params.id) {
            return res.status(400).json({ error: "Something went wrong", success: false })
        }
        if (!find_user) {
            return res.status(400).json({ error: "User not found", success: false })
        }
        let find_user2 = await NewUsers.findByIdAndUpdate(req.params.id, { $push: { follow_messages: { follower: current_user.username, follower_id: current_user._id, profile: current_user.profile } } }, {new:true})
        find_user = await NewUsers.findByIdAndUpdate(req.params.id, { $push: { follower: current_user.username } }, { new: true }).select("-password")
        me = await NewUsers.findByIdAndUpdate(current_user._id, { $push: { following: find_user.username } }, { new: true })
        res.json({ find_user, text: "Unfollow" })
    })
    router.put("/unfollow/:id", Fetchuser, async (req, res) => {
        let find_user = await NewUsers.findById(req.params.id)
        let me = await NewUsers.findById(current_user._id)
        if (!find_user) {
            return res.status(400).json({ error: "User not found", success: false })
        }
        find_user = await NewUsers.findByIdAndUpdate(req.params.id, { $pull: { follower: current_user.username } }, { new: true }).select("-password")
        let find_user2 = await NewUsers.findByIdAndUpdate(req.params.id, { $pull: { follow_messages: { follower: current_user.username, follower_id: current_user._id, profile: current_user.profile } } }, {new:true})
        me = await NewUsers.findByIdAndUpdate(current_user._id, { $pull: { following: find_user.username } }, { new: true })
        res.json({ find_user, text: "Follow" })
    })
    router.post("/search/user", Fetchuser, async (req, res) => {
        const { name } = req.body
        if (!name) {
            return res.json({ msg: "Name is required" })
        }
        const find_user = await NewUsers.find({ name: { $regex: name, $options: "$i" } }).select("-password")
        if (!find_user) {
            return res.status(400).json({ error: "User not found" })
        }
        res.json({ find_user })
    })
    router.post("/suggest/user", Fetchuser, async (req, res) => {
        const find_user = await NewUsers.find({ verified: "Yes" })
        if (!find_user) {
            return res.json({ msg: "No suggestion right now", success: false })
        }
        res.json({ find_user })
    })
    router.post("/message/users", Fetchuser, async (req, res) => {
        const find_user = await NewUsers.find({})
        if (!find_user || find_user.length < 1) {
            return res.status(400).json({ msg: "You are our first user", success: false })
        }
        const filter_user = find_user.filter((e) => {
            return e.follower.includes(current_user.username)
        })
        if (!filter_user) {
            return res.json({ msg: "Follow other peoples to see their posts", success: false })
        }
        res.json({ filter_user })
    })

} catch (error) {
    if (error) {
        return res.status(500).json({ error: "Internal Server Error", Server: "ServerError" })
    }
}
module.exports = router