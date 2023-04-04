const authorizedRole = (...roles)=>{
    return (req,res,next) => {
    
        if(! roles.includes(req.user.role)){
           return res.status(403).json({errorMsg: `${req.user.role} is not authorized`})
        }

        next()

    }
    }

    module.exports = authorizedRole