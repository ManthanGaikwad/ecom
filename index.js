require('dotenv').config();

const express = require('express')

const app = express()

const mongoose = require('mongoose')
const cookieParser = require('cookie-parser') 


const mongoUrl ="mongodb://127.0.0.1:27017/mApp"//process.env.MY_MONGO_URL
//mongoose.connect(mongoUrl);
//database connection

mongoose.set("strictQuery", false);

mongoose.connect(mongoUrl,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then((res)=>{
    console.log('connect database');
}).catch((err)=>{
    console.log("database not connected");
})

const cors = require('cors')

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(cookieParser())



//for user routes
const userRoute = require('./routes/userRoutes')
app.use('/',userRoute)


//for admin routes
const adminRoutes = require('./routes/adminRoutes')
app.use('/admin',adminRoutes)





app.listen(process.env.PORT,()=>console.log('server is running 8000'))