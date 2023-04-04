const User = require('../models/user');
const nodeMailer = require('nodemailer');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')






//email send

const sendVerifyMail = async (name, email, user_id) => {
    try {

        const transport = nodeMailer.createTransport({
            host: 'smtp.server.com',
            port: 2525,
            secure: false,
            service: 'gmail',
            //requireTLS:true,            
            auth: {
                user: process.env.MY_EMAIL,
                pass: process.env.MY_PASSWORD
            }
        })

        const mailOption = {
            from: process.env.MY_EMAIL,
            to: email,
            subject: 'verification mail',
            html: '<P> Hi ' + name + ', <br /> We need a little more information to complete your registration, including a confirmation of your email address. <br /> please click here <a href="http://localhost:3000/verified/' + user_id + '">verify</a> your email <br/>Thanks! – The [company] team </p>'
        }
        transport.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('email send :', info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}

//for send mail forgot

const transport = nodeMailer.createTransport({
    host: 'smtp.server.com',
    port: 2525,
    secure: false,
    service: 'gmail',
    //requireTLS:true,            
    auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD
    }
})


//registration

const insertUser = async (req, res) => {
    const { name, email, password, cPassword, mobile } = req.body;
    //console.log(req.body)

    if (!name || !email || !password || !cPassword || !mobile) {
       res.send({ error: "fill all details" })
    }
    try {
        const preUser = await User.findOne({ email: email });



        if (preUser) {
            res.status(400).send({ error: "This email already exists" })
        } else if (password !== cPassword) {
            res.status(400).send({ error: "Both password not match" })
        }
        else {

            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                image: req.file.filename,
                password: req.body.password,
                cPassword: req.body.cPassword,
                is_admin: 0
            });

            //return promise
            const userData = await user.save();
            if (userData) {

                sendVerifyMail(req.body.name, req.body.email, userData._id)

                res.status(201).send({ success: ' sign in successfully please verify your email' })
            } else {
                res.send({ error: ' failed' })

            }
        }

    } catch (error) {
        console.log(error.message);
    }
}


//verification email

const verifyMail = async (req, res) => {
    try {

        //id = req.params.id
       // console.log(id)
        // const user = await User.findOne({_id:req.params.id});
        const updateInfo = await User.updateOne({ _id: req.params.id }, { $set: { is_verified: 1 } });


        //console.log(updateInfo);

        res.status(201).send({ success: 'email-verified' })

    } catch (error) {
        res.status(error)
        console.log(error);
    }
}


//verify login user

const login = async (req, res) => {



    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ error: "fill all details" })
        }

        const userData = await User.findOne({ email: email })

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if (userData.is_verified === 0) {
                    res.status(400).send({ error: 'Please verify your mail' })
                }
                else {
                    //generate token
                    const token = jwt.sign({id:userData._id},process.env.MY_SESSION_SECRET,{
                        expiresIn:'120s'
                    })

                    //console.log('generated token',token);

                 /*    if(req.cookies[`${userData._id}`]){
                        req.cookies[`${userData._id}`]=""
                } */

                 
                    //store token in cookie
                    res.cookie('token',token,{
                        path:'/',
                       
                        expiresIn:new Date(Date.now() +1000*120 ),
                        httpOnly:true,
                    })
                   // req.session.user_id = userData._id
                    //let {password,cPassword, ...foundUser} = userData._doc;
                    res.status(200).send({ success: "successfully logged in",token })
                }
            } else {
                res.status(400).send({ error: 'Email and password incorrect' });

            }

        } else {
            res.status(400).json({ error: 'Email and password incorrect' });
        }

    } catch (error) {
         res.status(400).json({ error: 'Invalid Credentials' });
    }
}

//send forgot verify email
const forgotVerify = async (req, res) => {
    try {

        const email = req.body.email;

        if (!email) {
            return res.status(400).send({ error: "Enter your email !!" });
        }

        const userData = await User.findOne({ email: email })
        if (userData) {

            if (userData.is_verified === 0) {
                res.status(422).send({ error: 'User email is incorrect' })

            } else {
                //const randomString = randomstring.generate();
                const key = process.env.MY_SESSION_SECRET
                const randomString = jwt.sign({ _id: userData._id }, key, {
                    expiresIn: '1d'
                })
                const updateData = await User.findByIdAndUpdate({ _id: userData._id }, { token: randomString }, { new: true })

                if (updateData) {
                    const mailOption = {
                        from: process.env.MY_EMAIL,
                        to: email,
                        subject: 'Reset password',
                        text: `Hi ${updateData.name}, this link is valid for 3 min http://localhost:3000/reset/${userData._id}/${updateData.token}`

                    }
                    transport.sendMail(mailOption, function (error, info) {
                        if (error) {
                            console.log(error);
                            res.status(401).send({ error: 'Email not send' })

                        } else {
                           // console.log('email send :', info.response);
                            res.status(201).send({ success: 'Please check your email and reset your password' })
                        }
                    })
                }
            }

        } else {
            res.status(401).json({ error: 'user email is incorrect' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server problem' });
    }
}


const forgotPassword = async (req, res) => {
    const { id, token } = req.params;
    try {
        const validUser = await User.findOne({ _id: id, token: token })
        //console.log(validUser);
        const key = process.env.MY_SESSION_SECRET
        const verifyToken = jwt.verify(token, key)
        //console.log(verifyToken);
        if (validUser && verifyToken._id) {
            res.status(201).send({ success: 'User valid' })
        } else {
            res.status(401).send({ error: 'User not found' })
        }
    } catch (error) {
        res.status(401).send({ error: 'User Token is not Valid' })
    }
}



const changePassword = async (req, res) => {
    const { id, token } = req.params;

    try {
        const validUser = await User.findOne({ _id: id, token: token })
        //console.log(validUser);
        const key = process.env.MY_SESSION_SECRET
        const verifyToken = jwt.verify(token, key)
        //console.log(verifyToken);
        if (validUser && verifyToken._id) {

            plaintext = req.body.password
            if (!plaintext) {
                return res.status(400).send({ error: "fill all details" });
            }
            let salt = 12
            const hashPassword = await bcrypt.hash(plaintext, salt);


            const setNewPassword = await User.findOneAndUpdate({ _id: id }, { $set: { password: hashPassword, cPassword:hashPassword, token: '' } })


            res.status(201).json({ success: 'Password changed ' })
        } else {
            res.status(401).send({ error: 'User not found' })
        }

    } catch (error) {
        res.status(401).send({ error: 'User Token is expired' })
    }
}

const dashboard = async (req,res)=>{
    const userId = req.user
   try {
    const foundUser = await User.findById(userId).select("-password -cPassword")
    if(!foundUser){
        return res.status(404).json({error:'user not found!'})
       }
    
       return res.status(200).json({foundUser})
   } catch (error) {
    console.log(error);
   }
  
}


const logout = async (req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({message:"logout successfully"})
}




module.exports = {
    insertUser,
    verifyMail,
    login,
    forgotVerify,
    forgotPassword,
    changePassword,
    dashboard,
    logout
}