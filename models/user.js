const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique: true
    },
    email:{
        type:String,
        unique : true,
        required:true
    },
    mobile:{
        type:String,
        required:true,
        unique : true
    },
    image:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
   
    },
    cPassword:{
        type:String,
        required:true
      
    },
    role:{
        type:String,
        default:"user"
    },
    is_verified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    }
});


const bcrypt = require('bcrypt');
const saltRounds = 10;


//hash password
userSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, saltRounds);
    this.cPassword = await bcrypt.hash(this.cPassword, saltRounds);

    next();
})








module.exports = mongoose.model('User', userSchema)