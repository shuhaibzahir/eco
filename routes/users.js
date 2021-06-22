var express = require('express');
var router = express.Router();
const userDB = require("../helper/userdb")
const client = require('twilio')(process.env.TWILIO_ID , process.env.TWILIO_TOKEN);
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
    let signinStatus ={}
    userDB.userSignin(req.body).then((user)=>{
        console.log(user);
       if(user.status == false){
            signinStatus={
                status:false,
                msg:"Your are Blocked by Admin"
            }
            res.json(signinStatus)
       }else{
        signinStatus={
            status:true,
        }
        res.json(signinStatus)
       }
      
    }).catch((err)=>{
        console.log(err);
        signinStatus={
            status:false,
            msg:err
        }
        res.json(signinStatus)
    })
})

// otp login with twilio

var otp;
var phoneID;
router.post("/otp-login",(req,res)=>{
     
    let otpLoginStatus ={};
    userDB.checkPhone(req.body).then((user)=>{
        phoneID= user.phone;
        let random =Math.floor(Math.random()*1000000)
        otp=random;
    client.messages
      .create({body:`Your Login Otp is ${otp}`, from: '+14233456669', to: `+91${phoneID}`})
      .then((message) => {
          otpLoginStatus={
            status:true,
          }
          res.json(otpLoginStatus)
      });
    }).catch((err)=>{
         otpLoginStatus={
             status:false,
             msg:err
         }
         res.json(otpLoginStatus)
    })
})
// otp Submitting
router.post("/otp-submit",(req,res)=>{
    let otpSubmitStatus={}
    let submittedOtp = req.body.otp;
    if(submittedOtp == otp){
         otpSubmitStatus={
             status:true
         }
         res.json(otpSubmitStatus)
    }else{
        otpSubmitStatus={
            status:false,
            msg:"Invalid OTP "
        }
        res.json(otpSubmitStatus)
    }
})
router.get("/success",(req,res)=>{
    res.write("<h1>Success</h1>")
    res.send()
})
module.exports = router;
