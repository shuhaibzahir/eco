var express = require('express');
var router = express.Router();
const userDB = require("../helper/userdb")
 
router.get('/', function(req, res, next) {
res.render("userpages/main")
});

router.get("/login",function(req,res){
    res.render("userpages/userlogin")
})
 
// user sign up form  post form 
router.post("/signup",(req,res)=>{
    console.log(req.body);
    userDB.userSignup(req.body).then((data)=>{
        console.log(data);
    }).then((err)=>{

    })
})

module.exports = router;
