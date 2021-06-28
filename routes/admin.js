var express = require('express');
var router = express.Router();
const userDB = require('../helper/userdb')
const adminDB = require('../helper/admindb')
const productDB = require("../helper/product")
const fs = require('fs')


// ..........main authentication....................
function auth(req, res, next) {
  if (req.session.admin) {
    next()
  } else {
    res.redirect("/admin")
  }
}
router.get('/', function (req, res, next) {
  if (req.session.admin) {
    res.redirect("/admin/dashboard")
  } else {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/adminlogin", {
      layout: "adminLayout"
    })
  }

});
// ..........main authentication end.................................

// ..........Admin login post method...................................
router.post('/login', (req, res) => {
 
  let adminLoginStatus = {}
  adminDB.adminLogin(req.body).then((data) => {
    console.log(data);
    req.session.admin = {
      status: true,
      details: data
    }
    console.log(req.session.admin)
    adminLoginStatus = {
      status: true,
    }
    res.json(adminLoginStatus)
  }).catch((err) => {
    adminLoginStatus = {
      status: false,
      msg: err,
    }
    res.json(adminLoginStatus)
  })
})
// ..........Admin login post method end....................


// ..........Admin Dashboard..................................
router.get("/dashboard", auth, (req, res) => {
  res.render("admin/dashboard", {
    layout: "adminLayout",
    adminStatus: true,
    adminData: req.session.admin.details
  })
})
// ..........Admin Dashboard end..............................

// ..........Add product get method page.............................
router.get("/add-product", auth, (req, res) => {

  productDB.categoryFetching().then((catData) => {
    let clothes;
    let watches;
    let footwear;

    catData.forEach(item => {
      if (item.section == "CLOTHES") {
        clothes = item;
      } else if (item.section == "FOOTWEAR" || item.section == "FOOTWEARS") {
        footwear = item;
      } else if (item.section == "WATCHE" || item.section == "WATCHES") {
        watches = item;
      } else {
        console.log(item)
      }
    });
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/addproduct", {
      layout: "adminLayout",
      adminStatus: true,
      clothes,
      watches,
      footwear,
    })

  }).catch((err) => {
    console.log(err)
  })



})

//  ......................add product post method................


router.post("/add-product/", (req, res) => {

  let allData = req.body;
  let tags = req.body.tags.split(",");



  let image1 = req.files.image1;
  let image2 = req.files.image2;
  let image3 = req.files.image3;
  let image4 = req.files.image4;


  productDB.addProduct(allData, tags).then((d) => {
    console.log(d)
    // image 1 
    image1.mv("./public/pimages/" + d._id + "001.jpg", err => {
      if (err) {
        console.log(err)
      }
    })
    image2.mv("./public/pimages/" + d._id + "002.jpg", err => {
      if (err) {
        console.log(err)
      }
    })
    image3.mv("./public/pimages/" + d._id + "003.jpg", err => {
      if (err) {
        console.log(err)
      }
    })
    image4.mv("./public/pimages/" + d._id + "004.jpg", err => {
      if (err) {
        console.log(err)
      }
    })
    res.redirect("/admin/view-allproduct")
  }).catch((err) => {
    res.redirect("/admin/add-product")
    console.log(err)
  })
})


// ...........add product post method end...............



// .......... view all product..............................
router.get("/view-allproduct", auth, (req, res) => {
  productDB.getAllProduct().then((resul) => {
    let allproduct = resul;
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/allproduct", {
      layout: "adminLayout",
      adminStatus: true,
      allproduct,
      adminData: req.session.admin.details
    })
  }).catch((err) => {
    console.log(err)
  })

})

// ...........edit product................


router.get("/edit-product/:topic",(req,res)=>{
  let pId = req.params.topic
  productDB.getOneProduct(pId).then((result)=>{
    
    let categories =[]
      let types = [];
      let brands=[];
    productDB.categorOnly().then((allgroupedCat)=>{
    
      let [filterdCat,brandsOfP,typesOfP]=allgroupedCat
      categories.push(...filterdCat)
      types.push(...typesOfP)
      brands.push(...brandsOfP)
     
    }).catch((errofCat)=>{console.log(errofCat)})
     res.render("admin/editproduct",{layout: "adminLayout",
     adminStatus: true,
     pDetails:result,
     categories,
     types,
     brands
     })
  }).catch((err)=>{
    console.log(err)
  })
 
})

 
// ..................edit product end.................

// ............edit product post methos.................

router.post("/edit-product/",(req,res)=>{
  let pId = req.body.productID
  let allData = req.body;
  let tags = req.body.tags.split(",");

  productDB.editProduct(allData, tags,pId).then((d) => {
    
     if(req.files.image1!=null){
      let image1 = req.files.image1;
      image1.mv("./public/pimages/" + d._id + "001.jpg", err => {
        if (err) {
          console.log(err)
        }
      })
     }
     if(req.files.image2!=null){
      let image2 = req.files.image2;
      image2.mv("./public/pimages/" + d._id + "002.jpg", err => {
        if (err) {
          console.log(err)
        }
      })
     }
     if(req.files.image3!=null){
       let image3 = req.files.image3;
      image3.mv("./public/pimages/" + d._id + "003.jpg", err => {
        if (err) {
          console.log(err)
        }
      })
     }
     if(req.files.image4!=null){
      image4.mv("./public/pimages/" + d._id + "004.jpg", err => {
        if (err) {
          console.log(err)
        }
      })
     }
   
    res.redirect("/admin/view-allproduct")
  }).catch((err) => {
    res.redirect("/admin/add-product")
    console.log(err)
  })
   
})




router.get("/test",(req,res)=>{
  console.log("testing")
})


















// ..............delete product.....................
router.get("/delete-product/:id",(req,res)=>{
  let id = req.params.id;
   productDB.delteProduct(id).then((result)=>{
    let idOfItem = result._id;
    fs.unlink("./public/pimages/" +idOfItem + "001.jpg",(err)=> {if(err){console.log(err)}})
    fs.unlink("./public/pimages/" +idOfItem + "002.jpg",(err)=>{if(err){console.log(err)}})
    fs.unlink("./public/pimages/" +idOfItem + "003.jpg",(err)=>{if(err){console.log(err)}})
    fs.unlink("./public/pimages/" +idOfItem + "004.jpg",(err)=>{if(err){console.log(err)}})
    res.redirect("/admin/view-allproduct")
  }).catch((err)=>{
    console.log(err)
  })
})







// ..................delete product end..........

// ................user-data get method............................
router.get("/user-data", auth, (req, res) => {
  userDB.getAllUsers().then((data) => {
    console.log(data)
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/usertable", {
      layout: "adminLayout",
      adminStatus: true,
      users: data,
      adminData: req.session.admin.details
    })
  }).catch((err) => {
    console.log(err)
  })
})

// ................user-data get method end.......................

// ................user-data change status.......................
router.post("/user/change-status", (req, res) => {
  console.log(req.body)
  console.log(req.body)
  userDB.changeStatus(req.body).then((data) => {
    console.log(data)
    let changeStatus = {
      status: data
    }
    res.json(changeStatus)
  })
})

// ................user-data get change status end.......................

// .............category section....................
router.get("/cat-manage", (req, res) => {
  productDB.categoryFetching().then((dat) => {
    let clothes;
    let watches;
    let footwear;

    dat.forEach(item => {
      if (item.section == "CLOTHES") {
        clothes = item;
      } else if (item.section == "FOOTWEAR" || item.section == "FOOTWEARS") {
        footwear = item;
      } else if (item.section == "WATCHE" || item.section == "WATCHES") {
        watches = item;
      } else {
        console.log(item)
      }
    });
    res.render("admin/catmanagement", {
      layout: "adminLayout",
      adminStatus: true,
      types: dat,
      clothes,
      watches,
      footwear
    })
  }).catch((err) => {
    console.log(err)
  })
})
// .............category section end....................


// .............category main catgory start....................
router.post("/main-section", (req, res) => {
  let sectionCatst = {}
  let section = req.body.section
  section = section.toUpperCase()
  productDB.sectionManage(section).then((sec) => {
    sectionCatst = {
      status: true }
    res.json(sectionCatst)
  }).catch((err) => {
     
    sectionCatst = {
      status: false,
      msg: err
    }
    res.json(sectionCatst)
  })
})

// .............category main catgory start....................


// .................sub cat adding ............................
router.post("/add-subcat", (req, res) => {

  let nameOfPropery = req.body.name.toUpperCase()
  let subCatStatus = {}
  productDB.subCategoryAdd(req.body, nameOfPropery).then((data) => {
    subCatStatus = {
      status: true
    }
    res.json(subCatStatus)
  }).catch((err) => {
    subCatStatus = {
      status: false,
      msg: err
    }
    res.json(subCatStatus)
  })


})
// .................sub cat adding end............................

// .........delete sub category ....................

router.get("/del-cat/:section/:options/:item", (req, res) => {
 
  let section = req.params.section.toUpperCase()
  let item = req.params.item.toUpperCase() 
  let option = req.params.options 
 
  
  productDB.deleteSub(section,option,item).then((result)=>{
    res.redirect("/admin/cat-manage")
  }).catch((err)=>{
    console.log(err)
    res.redirect("/admin/cat-manage")
  })
  

})

 
//....................delete sub end...................




// ...........admin logout................
router.get("/account/logout", (req, res) => {
  delete req.session.admin
  res.redirect("/admin")
})



module.exports = router;