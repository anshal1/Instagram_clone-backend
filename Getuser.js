    const jwt = require("jsonwebtoken")
const NewUsers = require("./MongoDB/UserSchema")
const Sc = "%$&^%&^*(*(&*(^&*$^@"

const Fetchuser =async(req, res, next)=>{
    try {
        const token = req.header("instagram_clone")
        if(!token){
            return res.status(400).json({error: "Unauthorized action", success: false})
        }
        const ID = jwt.verify(token, Sc)
        const getuser = await NewUsers.findById(ID.userid)
        if(!ID){
            return res.status(400).json({error: "No ID found"})
        }
        if(!getuser){
            return res.status(400).json({error: "User not found", success: false})
        }
        current_user = getuser
        
    } catch (error) {
        if(error){
            return res.status(500).json({error: "Internal server error", Server: "ServerError"})
        }
    }
    next()
}
module.exports = Fetchuser