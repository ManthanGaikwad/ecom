const express = require('express');
const user_route = express()
const path = require('path')
const multer = require('multer');

//multer
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'))
    },
    filename:function(req,file,cb){
        const name = file.originalname;
        cb(null,name)
    }
});

const upload = multer({storage:storage})


user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}))

user_route.use(express.static('public/userImages'))



const controller = require('../controllers/userController')
const verifyToken = require('../middleware/userAuth')
const refreshToken = require('../middleware/refreshToken')

user_route.get('/',(req,res)=>{
    res.send('hello')
})

user_route.post('/register', upload.single('image'),controller.insertUser)

user_route.get('/verify/:id',controller.verifyMail)

user_route.post('/login',controller.login)

user_route.post('/forget',controller.forgotVerify)

user_route.get('/forgotpassword/:id/:token',controller.forgotPassword)

user_route.post('/:id/:token',controller.changePassword)

user_route.get('/home',verifyToken,controller.dashboard)

user_route.get('/refresh',refreshToken,verifyToken,controller.dashboard)

user_route.get('/logout',controller.logout)





module.exports = user_route