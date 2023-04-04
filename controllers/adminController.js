const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')



const verifyLogin = async (req, res) => {
    try {
        const {email,password} = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'fill details' })
        }

        const userData = await User.findOne({ email: email });

        if (userData) {

            const matchPass = await bcrypt.compare(password, userData.password);
            if (matchPass) {

                if (userData.role === 'user') {
                    res.status(401).json({ error: ' Your are not admin' })

                } else {

                      //generate token
                      const token = jwt.sign({id:userData._id},process.env.MY_SESSION_SECRET,{
                        expiresIn:'120s'
                    })
                   
                     //store token in cookie
                     res.cookie('token',token,{
                        path:'/',
                        expiresIn:new Date(Date.now() +1000*120 ),
                        httpOnly:true,
                    })

                    //console.log('generated token',token);
                    res.status(200).send({ success: "successfully logged in",  })
                }

            } else {
                res.status(401).json({ error: 'email and password incorrect' })
            }
        } else {
            res.status(401).json({ error: 'email and password incorrect' })
        }
    } catch (error) {
console.log(error.message)    }
}

const adminDashboard = async (req, res) => {
    const userId = req.user
    try {

       /* console.log(req.query)
        const search = req.query.search || '';
        const query = {
            name:{$regex:search,$options:'i'}
        }
        */

     const foundUser = await User.findById(userId).select("-password -cPassword")
     const getUser = await User.find({role:'user',}).select("-password -cPassword")
     if(!foundUser){
         return res.status(404).json({error:'user not found!'})
        }
     
        return res.status(200).json({foundUser,getUser})
    } catch (error) {
     console.log(error);
    }
  
}

const getUser = async (req, res) => {
    try {
        // console.log(req.params);

        const { id } = req.params;
        const userData = await User.findById({ _id: id }).select("-password -cPassword")
        //console.log(userData);
        res.status(200).json({ userData })
    } catch (error) {
        res.status(400).json({ error: 'No user found' })
    }
}

const updatedUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, email, mobile,status } = req.body;
        const updatedData =  await User.findByIdAndUpdate({_id:id},{$set:{name:req.body.name, email:req.body.email, mobile:req.body.mobile}})

        res.status(201).json({success:'Updated Successfully '})

        

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "something went wrong" })

    }
}

const deleteUser = async(req,res)=>{
    try {
        const id = req.params.id;
        const deleteUser = await User.findByIdAndDelete({_id:id})
        //console.log(deleteUser);
        res.status(200).json({success:"deleted"})
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"something wrong"})
    }
}

const logout = async(req,res)=>{
    try {
        res.clearCookie();
        res.cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true
        })
    
        res.status(200).json({success:"logout successfully"})
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    verifyLogin,
    adminDashboard,
    getUser,
    updatedUser,
    deleteUser,
    logout
}
