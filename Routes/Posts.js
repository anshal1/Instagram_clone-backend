const express = require("express")
const router = express.Router()
const Feed = require("../MongoDB/PostSchema")
const { body, validationResult } = require('express-validator');
const NewUsers = require("../MongoDB/UserSchema")
const multer = require("multer")
const path = require("path");
const fs = require("fs")
const Fetchuser = require("../Getuser");
const User_story = require("../MongoDB/StorySchema");
const CommentSchema = require("../MongoDB/Comments");
const Saved = require("../MongoDB/Saved");
const sharp = require("sharp")
const cloudinary = require("cloudinary")
require("dotenv").config()
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
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
router.post("/share/post", Fetchuser, upload.single("post"), async (req, res) => {
    const { caption, hashtags } = req.body
    await sharp(req.file.path).resize({ width: 480, height: 512 }).jpeg({ quality: 80 }).toFile("./upload/" + req.file.filename)
    cloudinary.v2.uploader.upload("upload/" + req.file.filename, { public_id: req.file.filename }).then((result) => {
        if (result) {
            Feed.create({
                image: result.url,
                caption,
                hashtags,
                user_id: current_user._id,
                user_profile: current_user.profile,
                username: current_user.username,
                post_id: req.file.filename
            })
            fs.unlinkSync("./upload/" + req.file.filename)
        }
        return res.send("Uploaded successfully")
    }).catch((err) => {
        res.send(err.error.message)
        fs.unlinkSync("./upload/" + req.file.filename)
        return console.log(err)
    })
})
router.get("/all/post", async (req, res) => {
    const allpost = await Feed.find()
    res.json({ allpost })
})
router.put("/like/:id", Fetchuser, async (req, res) => {
    let find_post = await Feed.findById(req.params.id)
    if (!find_post) {
        return res.status(400).json({ error: "Post unavailable", success: false })
    }
    find_post = await Feed.findByIdAndUpdate(req.params.id, { $push: { likes: current_user.username } }, { new: true })
    let find_user = await NewUsers.findById(find_post.user_id)
    if (!find_user) {
        return res.status(400).json({ error: "User not found" })
    }
    const NewDate = new Date()
    find_user = await NewUsers.findByIdAndUpdate(find_post.user_id, { $push: { like_messages: { liker: current_user.username, liker_id: current_user._id, post_id: find_post._id, profile: current_user.profile, date: NewDate } } }, { new: true })
    res.json({ find_post })
})
router.put("/unlike/:id", Fetchuser, async (req, res) => {
    let find_post = await Feed.findById(req.params.id)
    if (!find_post) {
        return res.status(400).json({ error: "Post unavailable", success: false })
    }
    find_post = await Feed.findByIdAndUpdate(req.params.id, { $pull: { likes: current_user.username } }, { new: true })
    let find_user = await NewUsers.findById(find_post.user_id)
    if (!find_user) {
        return res.status(400).json({ error: "User not found" })
    }
    find_user = await NewUsers.findByIdAndUpdate(find_post.user_id, { $pull: { like_messages: { liker: current_user.username, liker_id: current_user._id, post_id: find_post._id, } } }, { new: true })
    res.json({ find_post })
})
router.post("/user/post", Fetchuser, async (req, res) => {
    const find_post = await Feed.find({ user_id: current_user._id })
    if (!find_post) {
        return res.status(400).json({ error: "No Posts", success: false })
    }
    res.json({ find_post })
})
router.post("/comment/:id", [body("comment").exists()], Fetchuser, async (req, res) => {
    const { comment } = req.body
    if (!comment) {
        return res.status(400).json({ error: "Comment cannot be empty" })
    }
    let find_post = await Feed.findById(req.params.id)
    if (!find_post) {
        return res.status(400).json({ error: "Post Unavailable" })
    }
    find_post = await Feed.findByIdAndUpdate(req.params.id, { $push: { comments: { username: current_user.username, comment: comment, user_id: current_user._id, profile: current_user.profile } } }, { new: true })
    const create_Comment = await CommentSchema.create({
        username: current_user.username,
        comment: comment,
        user_id: current_user._id,
        profile: current_user.profile,
        post_id: req.params.id,
        post_owner: find_post.username
    })
    let find_user = await NewUsers.findById(find_post.user_id)
    if (!find_user) {
        return res.status(400).json({ error: "User not found" })
    }
    find_user = await NewUsers.findByIdAndUpdate(find_post.user_id, { $push: { comment_messages: { commentor: current_user.username, commentor_id: current_user._id, post_id: find_post._id, profile: current_user.profile, date: Date.now() } } }, { new: true })
    res.json({ find_post })
})

// // ? i have to fix the story route later
// router.post("/story", Fetchuser, upload.single("story"), async (req, res) => {
//     // ? checking if file exists or not
//     if (!req.file) {
//         return res.status(404).send("File not found")
//     }
//     console.log(req.file)

// })
router.post("/follower/posts", Fetchuser, async (req, res) => {
    const find_user = await NewUsers.find({})
    const user_posts = await Feed.find({ user_id: current_user.id })
    if (!find_user || find_user.length < 1) {
        return res.status(400).json({ msg: "You are our first user", success: false })
    }
    const filter_user = find_user.filter((e) => {
        return e.follower.includes(current_user.username)
    })
    if (!filter_user || filter_user.length < 1) {
        return res.json({ msg: "Follow other peoples to see their posts", success: false })
    }
    for (user of filter_user) {
        const _post = await Feed.find({ user_id: user._id })
        const follower_post = _post.concat(user_posts)
        return res.json({ follower_post, success: true })
    }
})
router.post("/user/story", Fetchuser, async (req, res) => {
    const story = await User_story.findOne({ user_id: current_user._id })
    if (!story) {
        return res.json({ msg: "Add a story", success: false })
    }
    res.json({ story })
})
router.post("/follower/story", Fetchuser, async (req, res) => {
    const find_user = await NewUsers.find()
    if (!find_user || find_user.length < 1) {
        return res.status(400).json({ msg: "You are our first user", success: false })
    }
    const filter_user = find_user.filter((e) => {
        return e.follower.includes(current_user.username)
    })
    if (!filter_user || filter_user.length < 1) {
        return res.json({ msg: "Follow other peoples to see their posts", success: false })
    }
    for (user of filter_user) {
        const story = await User_story.find({ user_id: user._id })
        return res.json({ story })
    }
})
router.post("/one/user/story/:id", Fetchuser, async (req, res) => {
    const story = await User_story.findOne({ user_id: req.params.id })
    if (!story) {
        return res.json({ msg: "No stories" })
    }
    res.json({ story })
})
// router.delete("/remove/story", Fetchuser, async (req, res) => {
//     let find_story = await User_story.findOne({ user_id: current_user._id })
//     if (!current_user) {
//         return res.status(400).json({ error: "User not found" })
//     }
//     if (!find_story) {
//         return res.status(400).json({ error: "No story found" })
//     }
//     if (current_user.id.toString() !== find_story.user_id) {
//         return res.status(401).json({ error: "Unauthorized action" })
//     }

//     try {
//         fs.unlink(Dir + "/" + `${current_user._id}.jpeg`)
//         find_story = await User_story.findOneAndDelete({ user_id: current_user._id })
//         return res.status(200).json({ Msg: "Successfull Deleted" })
//     } catch (error) {
//         if (error) {
//             return res.status(500).json({ error })
//         }
//     }
// })
router.delete("/delete/post/:id", Fetchuser, async (req, res) => {
    let find_post = await Feed.findById(req.params.id)
    if (!find_post) {
        return res.status(400).json({ error: "Post not found", success: false })
    }
    if (find_post.user_id.toString() !== current_user._id.toString()) {
        return res.status(401).json({ error: "Unauthorized action" })
    }
    cloudinary.uploader.destroy(find_post.post_id).then((result) => {
        return 
    }).catch((err) => {
        return console.log(err)
    })
    let delete_saved = await Saved.findOneAndDelete({ post_id: req.params.id })
    find_post = await Feed.findByIdAndDelete(req.params.id)
    res.json({ msg: "Deleted", success: true })
})
router.post("/post/comment/:id", Fetchuser, async (req, res) => {
    const find_post = await Feed.findById(req.params.id)
    if (!find_post) {
        return res.status(400).json({ error: "Post not found" })
    }
    res.json({ find_post })
})
router.post("/one/user/post/:id", Fetchuser, async (req, res) => {
    if (!req.params.id) {
        return res.status(400).json({ error: "User not found" })
    }
    const find_post = await Feed.find({ user_id: req.params.id })
    if (!find_post) {
        return res.status(400).json({ msg: "No post available" })
    }
    res.json({ find_post })
})
router.post("/one/post/:id", Fetchuser, async (req, res) => {
    const find_post = await Feed.findById(req.params.id)
    if (!find_post) {
        return res.status(400).json({ error: "Post not found" })
    }
    res.json({ find_post })
})
router.post("/all/comments/:id", Fetchuser, async (req, res) => {
    const find_comments = await CommentSchema.find({ post_id: req.params.id })
    if (!find_comments || find_comments.length < 1) {
        return res.json({ error: "No comments" })
    }
    res.json({ find_comments })
})
router.put("/save/:id", Fetchuser, async (req, res) => {
    let find_post = await Feed.findById(req.params.id)
    if (!find_post) {
        return res.status(400).json({ error: "Post Unavialable" })
    }
    find_post = await Feed.findByIdAndUpdate(req.params.id, { $push: { saved: current_user.username } }, { new: true })
    const save_post = Saved.create({
        post: find_post,
        user_id: current_user._id,
        post_id: find_post._id
    })
    res.json({ find_post, msg: "Saved", success: true })
})
router.put("/remove/save/:id", Fetchuser, async (req, res) => {
    try {
        let find_post = await Feed.findById(req.params.id)
        let find_saved = await Saved.findOne({ post_id: req.params.id })
        if (!find_post) {
            return res.status(400).json({ error: "Post Unavialable" })
        }
        find_post = await Feed.findByIdAndUpdate(req.params.id, { $pull: { saved: current_user.username } }, { new: true })
        find_saved = await Saved.findOneAndDelete({ post_id: req.params.id, user_id: current_user._id })
        res.json({ msg: "Removed", success: true, find_post })
    } catch (error) {
        if (error) {
            return null
        }
    }
})
router.post("/saved/post", Fetchuser, async (req, res) => {
    const find_saved = await Saved.find({ user_id: current_user._id })
    if (!find_saved) {
        return res.json({ msg: "Post unavailable", success: false })
    }
    res.json({ find_saved })
})
module.exports = router