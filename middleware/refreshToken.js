const jwt = require('jsonwebtoken')
const User = require('../models/user')


const refreshToken = async (req,res,next)=>{
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "please login to access this resource" })
        }
        const decodeData = jwt.verify(token, process.env.MY_SESSION_SECRET,(err,user)=>{
            if(err){
                console.log(err);
                return res.status(403).json({error:"Authentication failed!!!"})

            }
            res.clearCookie(`${user}`)
            req.cookies[`${user}`] = "";

            const token = jwt.sign({id:user.id},process.env.MY_SESSION_SECRET,{
                expiresIn:'45s'
            })
            //console.log('new token',token);
            res.cookie('jwt',token,{
                path:'/',
                expires:new Date(Date.now() + 1000 * 40),
                httpOnly:true,
                sameSite:'lax'
            });
        })

        req.user = await User.findById(decodeData.id)

        next();
    } catch (error) {
        res.status(401).json({ message: "Token expired" })

    }


}

module.exports = refreshToken