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
    // console.log(req.body);
    let signUpStatus = {};
    userDB.userSignup(req.body).then((data)=>{
         signUpStatus={
             status:true,
             msg:"successfully Registerd"
         }
         res.json(signUpStatus)
    }).catch((err)=>{
        signUpStatus={
            status:false,
            msg:err
        }
        res.json(signUpStatus)
    })
})

// sign in post request
router.post("/sign-in",(req,res)=>{
    userDB.signIn(req.body).then((user)=>{
        console.log(user);
    }).catch((err)=>{
        console.log(err);
    })
})



router.get("/success",(req,res)=>{
    res.send("dsjfsdh")
})
module.exports = router;
