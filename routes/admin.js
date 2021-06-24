var express = require('express');
var router = express.Router();
const userDB = require('../helper/userdb')
const adminDB = require('../helper/admindb')
const productDB = require("../helper/product")
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
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
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

router.get("/dashboard",auth,(req,res)=>{
   res.render("admin/dashboard",{layout:"adminLayout",adminStatus:true,adminData:req.session.admin.details})
})

router.get("/add-product",(req,res)=>{
  productDB.getCatValues().then((result)=>{
    let watchCatData =result[0];
    let footCatData =result[1];
    let clothCatData =result[2]
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.render("admin/addproduct",
  {layout:"adminLayout",
  adminStatus:true,
   watchCatData  ,
   footCatData, 
    clothCatData
  
  })//adminStatus:true,adminData:req.session.admin.details
    
  }).catch((err)=>{console.log(err)})
  
})
// category edit
router.get("/admin/edit/category/:topic",(req,res)=>{
  let id = req.params.topics;
  productDB.getOneCategory(id).then((result=>{

  }).catch((err)=>{
    console.log(err)
  })
  res.render("admin/categoryedit",{layout:"adminLayout",adminStatus:true})
})

router.get("/user-data",auth,(req,res)=>{
  userDB.getAllUsers().then((data)=>{
    console.log(data)
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/usertable",{layout:"adminLayout",adminStatus:true,users:data,adminData:req.session.admin.details})
  }).catch((err)=>{
    console.log(err)
  })
})

router.post("/user/change-status",auth,(req,res)=>{
  console.log(req.body)
  console.log(req.body)
  userDB.changeStatus(req.body).then((data)=>{
    console.log(data)
    let changeStatus={
      status:data
    }
    res.json(changeStatus)
  }) 
})

// admin Logout
router.get("/account/logout",(req,res)=>{
  delete req.session.admin
  res.redirect("/admin")
})

// categoy management

router.get("/category",(req,res)=>{
  productDB.getAllCat().then((result)=>{
    console.log(result)
    let watch =[]
    let footwear =[]
    let clothes = []
    result.forEach((item)=>{
      if(item.section =="watch"){
        watch.push(item)
      }else if(item.section =="footwear"){
        footwear.push(item)
      }else{
        clothes.push(item)
      }
     
    })
    console.log(footwear)
    res.render("admin/category",{layout:"adminLayout",clothes,watch,footwear,adminStatus:true,})
  }).catch((err)=>{
    console.log(err)
  })
  
})
// categoy management post
router.post("/category/management",(req,res)=>{
   
  let catStatus={}
  productDB.categoryManage(req.body).then((result)=>{

    catStatus = {status:true}
    res.json(catStatus)
  }).catch((err)=>{
   
    catStatus = {status:false,msg:err}
    res.json(catStatus)
  })
})

// admin product adding
router.post("/add-product/",(req,res)=>{

  let allData = req.body;
  let tags = req.body.tags.split(",");
  console.log(allData);
  console.log(tags)
  let image1 = req.files.image1;
  let image2 = req.files.image2;
  let image3 = req.files.image3;
  let image4 = req.files.image4;

  console.log(image1)
  console.log(image2)
  console.log(image3)
  console.log(image4)

  productDB.addFootwareProduct(allData,tags).then((d)=>{
    console.log(d)
    // image 1 
    image1.mv("./public/pimages/"+d._id+"001.jpg",err => {
      if(err) {console.log(err)}
    })
    image2.mv("./public/pimages/"+d._id+"002.jpg",err => {
      if(err) {console.log(err)}
    }) 
    image3.mv("./public/pimages/"+d._id+"003.jpg",err => {
      if(err) {console.log(err)}
    })
    image4.mv("./public/pimages/"+d._id+"004.jpg",err => {
      if(err) {console.log(err)}
    })
   res.send("ha its uploaded")
  }).catch((err)=>{
    res.send("ha its some error")
    console.log(err)
  })
})

 


module.exports = router;
