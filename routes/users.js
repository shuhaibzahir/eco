var express = require('express');
const { FieldValueList } = require('twilio/lib/rest/preview/understand/assistant/fieldType/fieldValue');
var router = express.Router();
const userDB = require("../helper/userdb")
const client = require('twilio')(process.env.TWILIO_ID, process.env.TWILIO_TOKEN);


// check authentication

function auth(req, res, next) {
    if (req.session.user) {
        let uid = req.session.user.uid
        userDB.getOneUser(uid).then((reslt)=>{
            if(reslt.status){
                req.session.user.status = reslt.status  
                next(); 
            }else{
                delete req.session.user;
                res.redirect("/login")
            }
        }).catch((err)=>{
            console.log(err) //console the error herein
            res.redirect("/login")
        })
    }else{
        res.redirect("/login")
    }
}

// user navigate check 
 

router.get("/",  function (req, res) {
    
    if (req.session.user){
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.render("userpages/main",{ usernav:req.session.user})

    }
    else{
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.render("userpages/main", )
    }

      
});

router.get("/login", function (req, res) {
    console.log(req.session.user)
   if(req.session.user){
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
       res.redirect("/")
   }else{
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
       res.render("userpages/userlogin",)
   }
     
})

// user sign up form  post form 
router.post("/signup",  (req, res) => {
    // console.log(req.body);
    let signUpStatus = {};
    userDB.userSignup(req.body).then((data) => {
        signUpStatus = {
            status: true,
            msg: "successfully Registerd"
        }
        let demoUser = {
            uid: data._id,
            name: data.name,
            status: data.status
        }
        req.session.user = demoUser //this is session assign 
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.json(signUpStatus)
    }).catch((err) => {
        signUpStatus = {
            status: false,
            msg: err
        }
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.json(signUpStatus)
    })
})

// sign in post request
router.post("/sign-in", (req, res) => {
    let signinStatus = {}
    userDB.userSignin(req.body).then((user) => {
        
        if (user.status == false) {
            signinStatus = {
                status: false,
                msg: "Your are Blocked by Admin"
            }
            res.json(signinStatus)
        } else {
            signinStatus = {
                status: true,
            }
            let demoUser = {
                uid: user._id,
                name: user.name,
                status: user.status
            }
           
            req.session.user = demoUser //this is session assign 
            
            res.json(signinStatus)
        }

    }).catch((err) => {
        console.log(err);
        signinStatus = {
            status: false,
            msg: err
        }
        res.json(signinStatus)
    })
})

// otp login with twilio

var otp;
var u_id;
router.post("/otp-login", (req, res) => {

    let otpLoginStatus = {};
    userDB.checkPhone(req.body).then((user) => {
        u_id = user._id;
        let phoneID = user.phone;
        let random = Math.floor(Math.random() * 1000000)
        otp = random;
        client.messages
            .create({
                body: `Your Login Otp is ${otp}`,
                from: '+14233456669',
                to: `+91${phoneID}`
            })
            .then((message) => {
                console.log(message.sid);
            });
        otpLoginStatus = {
            status: true,
        }
        res.json(otpLoginStatus);
    }).catch((err) => {
        otpLoginStatus = {
            status: false,
            msg: err
        }
        res.json(otpLoginStatus)
    })
})
// otp Submitting
router.post("/otp-submit", (req, res) => {
    let otpSubmitStatus = {}
    let submittedOtp = req.body.otp;
    if (submittedOtp == otp) {
        userDB.getOneUser(u_id).then((userOne)=>{
            
            req.session.user = {
                uid: userOne._id,
                name: userOne.name,
                status: userOne.status
            }
        
             
            // setted session and sending ajax response
            otpSubmitStatus = {
                status: true
            }
            res.json(otpSubmitStatus)

        }).catch((err)=>{
            otpSubmitStatus = {
                status: false,
                msg: err
            }
            res.json(otpSubmitStatus)
        })
        
    } else {
        otpSubmitStatus = {
            status: false,
            msg: "Invalid OTP "
        }
        res.json(otpSubmitStatus)
    }
})

router.get("/logout",(req,res)=>{
    delete req.session.user;
    res.redirect("/")
})

router.get("/cart",auth, (req,res)=>{
     
})
 
 
module.exports = router;