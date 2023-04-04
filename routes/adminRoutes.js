const express = require('express')

const admin_route = express();

admin_route.use(express.static('public/userImages'))


const controller = require('../controllers/adminController')

const verifyToken = require('../middleware/userAuth')
const authorizedRole = require('../middleware/AdminAuth')

admin_route.get('/',(req,res)=>{
    res.send('hi')
})

admin_route.post('/',controller.verifyLogin)


admin_route.get('/Dashboards',verifyToken, authorizedRole("admin"),controller.adminDashboard)

admin_route.get('/user/:id',verifyToken, authorizedRole("admin"),controller.getUser)


admin_route.patch('/updateUser/:id',verifyToken, authorizedRole("admin"),controller.updatedUser)

admin_route.delete('/delUser/:id',verifyToken, authorizedRole("admin"),verifyToken,controller.deleteUser)

admin_route.get('/logout',controller.logout)



module.exports = admin_route