const mongoose = require('mongoose');

mongoose.set("strictQuery", false);

mongoose.connect("mongodb://127.0.0.1:27017/mApp",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>console.log('database connected')).catch((err)=>console.error(err));