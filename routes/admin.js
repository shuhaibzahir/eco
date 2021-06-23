var express = require('express');
var router = express.Router();
const userDB = require('../helper/userdb')
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

router.get("/add-product",(req,res)=>{
  res.render("admin/addproduct",{layout:"adminLayout",adminStatus:true})
})


router.get("/user-data",(req,res)=>{
  userDB.getAllUsers().then((data)=>{
    console.log(data)
    res.render("admin/usertable",{layout:"adminLayout",adminStatus:true,users:data})
  }).catch((err)=>{
    console.log(err)
  })
})

router.post("/user/change-status",(req,res)=>{
  console.log(req.body)
  userDB.changeStatus(req.body).then((data)=>{
  }).catch((err)=>{
    console.log(err)
  })
})

module.exports = router;
