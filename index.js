const express = require("express")
const app = express()
const PORT = process.env.PORT || 5000
const Connect = require("./MongoDB/Connection")
const cors = require('cors')
const path = require("path")
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, {
  // ? Change this to your specific url if you have downloaded the code from gitHub
  cors: {
    origin: "https://tiny-pavlova-64e5fb.netlify.app"
  }
})
require("dotenv").config()
app.use(cors({
  // ? Change this to your specific url if you have downloaded the code from gitHub
  origin: "https://tiny-pavlova-64e5fb.netlify.app"
}))
Connect()
app.use(express.json())
app.use("/", require("./Routes/Posts.js"))
app.use("/", require("./Routes/CreateUser.js"))
app.use("/", require("./Routes/MessageRoute.js"))


// ? Sockets function

let users = []
const adduser = (username, socketID) => {
  if (users.includes(username)) {
    return
  } else {
    users.push({ username, socketID })
    return 
  }
}
const getuser = (username) => {
  return users.find(User => User.username === username)
}

const removeuser = (socketID) => {
  users = users.filter(User => User.socketID !== socketID)
  return 
}

io.on("connection", socket => {
  // ? adding users to users array
  socket.on("newuser", (username) => {
    if (username) { 
      adduser(username, socket.id)
      return
    } else {
      return
    }
  })
  // ? sending all connected user to all users
  socket.on("connected_user", () => {
    io.emit("All_users", users)
  })
  // ? chat socket event to chat
  socket.on("chat", (message) => {
    try {
      const find_user = getuser(message.receiver_name)
      io.to(find_user.socketID).emit("receive_chat", message)
    } catch (err) {
      if (err) {
        return
      }
    }
  })

  // ? like socket
  socket.on("like", data =>{
    try {
      const find_user = getuser(data.username)
      io.to(find_user.socketID).emit("like_msg", data)
    } catch (err) {
      if (err) {
        return
      }
    }
  })
  socket.on("comment", data =>{
    try {
      const find_user = getuser(data.username)
      io.to(find_user.socketID).emit("comment_msg", data)
    } catch (err) {
      if (err) {
        return
      }
    }
  })
  socket.on("disconnect", (e) => {
    removeuser(socket.id)
    io.emit("All_users", users)
  })
})



server.listen(PORT, (err) => {
  if (err) {
    console.log(err)
    return res.status(500).json({ err: "Internal server error" })
  } else {
    console.log(`Instagram Running on Port ${PORT}`)
  }
})