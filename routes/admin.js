var express = require('express');
const { FlowValidateList } = require('twilio/lib/rest/studio/v2/flowValidate');
const { adminLogin } = require('../helper/admindb');
var router = express.Router();
const adminDB = require('../helper/admindb')
/* GET home page. */

function auth(req,res,next){
  if(req.session.admin){
    next()
  }else{
    res.redirect("/admin")
  }
}
router.get('/', function(req, res, next) {
  if(req.session.admin){
    res.redirect("/admin/dashboard")
  }else{
    res.render("admin/adminlogin",{layout:"adminLayout"})
  }
   
});

// admin login 
router.post('/login',(req,res)=>{
  console.log(req.body)
  let adminLoginStatus ={}
  adminDB.adminLogin(req.body).then((data)=>{
    console.log(data);
    req.session.admin = {
      status:true,
      details:data
    }
    console.log(  req.session.admin)
     adminLoginStatus={
       status:true,
     }
     res.json(adminLoginStatus)
  }).catch((err)=>{
    adminLoginStatus={
      status:false,
      msg:err,
    }
    res.json(adminLoginStatus)
  })
})

router.get("/dashboard",(req,res)=>{
   res.render("admin/dashboard",{layout:"adminLayout",adminStatus:true})
})

 
module.exports = router;
