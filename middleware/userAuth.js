
const jwt = require('jsonwebtoken')

const User = require('../models/user')

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ authorization: "please login to access this resource" })
        }
        const decodeData = jwt.verify(token, process.env.MY_SESSION_SECRET)
        req.user = await User.findById(decodeData.id)

        next();
    } catch (error) {
        res.status(401).json({ authorization: "Token expired" })

    }

}



module.exports = verifyToken

