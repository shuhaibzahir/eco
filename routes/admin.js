var express = require('express');
var router = express.Router();
const userDB = require('../helper/userdb')
const adminDB = require('../helper/admindb')
const productDB = require("../helper/product")
const fs = require('fs');
const { resolve } = require('path');


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
 
    res.render("admin/loginpage",{layout: "adminLayout",})
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
  
  userDB.getDashboardDetails().then((result)=>{
     let  chartData = JSON.stringify(result)
    let cardData = result;
   res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.render("admin/dashboard", {
    layout: "adminLayout",
    adminStatus: true,
    adminData: req.session.admin.details,
    chartData,
    cardData
    })
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
      adminData: req.session.admin.details,
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
  
    // const path1 = `./public/uploads/product_images/${tagId}-001.jpg`
    // const image1 = req.body.pro_img1;
    // const base64Data1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    // fs.writeFileSync(path1, base64Data1, { encoding: 'base64' });

  let allData = req.body;
  
  let tags = req.body.tags.trim().split(",")
  console.log(tags)
 
  // let image1 = req.files.image1;
  // let image2 = req.files.image2;
  // let image3 = req.files.image3;
  // let image4 = req.files.image4;
  let image1;
  let image2;
  let image3;
  let image4;

  
    if(req.body.sectionIdentify=="footwear"){
      image1 = req.body.image1_b64;
      image2 = req.body.image2_b64;
      image3 = req.body.image3_b64;
      image4 = req.body.image4_b64;
    }else if(req.body.sectionIdentify=="clothes"){
      image1 = req.body.image9_b64;
      image2 = req.body.image10_b64;
      image3 = req.body.image11_b64;
      image4 = req.body.image12_b64;
    }else if( req.body.sectionIdentify == "watches"){
      image1 = req.body.image5_b64;
      image2 = req.body.image6_b64;
      image3 = req.body.image7_b64;
      image4 = req.body.image8_b64;
    }


  productDB.addProduct(allData, tags).then((d) => {
   
    const path1 = `./public/pimages/${d._id}-001.jpg`;
    const path2 = `./public/pimages/${d._id}-002.jpg`;
    const path3 = `./public/pimages/${d._id}-003.jpg`;
    const path4 = `./public/pimages/${d._id}-004.jpg`;
    
   
    const base64Data1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const base64Data2 = image2.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const base64Data3 = image3.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    const base64Data4 = image4.replace(/^data:([A-Za-z-+/]+);base64,/, '');

    fs.writeFileSync(path1, base64Data1, { encoding: 'base64' });
    fs.writeFileSync(path2, base64Data2, { encoding: 'base64' });
    fs.writeFileSync(path3, base64Data3, { encoding: 'base64' });
    fs.writeFileSync(path4, base64Data4, { encoding: 'base64' });

    res.redirect("/admin/view-allproduct")
  }).catch((err) => {
    res.redirect("/admin/add-product")
    console.log(err)
  })
})


// // ...........add product post method end...............



// // .......... view all product..............................
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


router.get("/edit-product/:topic",auth,(req,res)=>{
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
       res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.render("admin/editproduct",{layout: "adminLayout",
      adminData: req.session.admin.details,
      adminStatus: true,
      pDetails:result,
      categories,
      types,
      brands
      })
    }).catch((errofCat)=>{if(errofCat){
      console.log(errofCat)
    }})
     
  }).catch((err)=>{
    console.log(err)
  })
 
})

 
// ..................edit product end.................

// ............edit product post methos.................

router.post("/edit-product/",auth,(req,res)=>{
  let pId = req.body.productID
  let allData = req.body;
  
   let tags = req.body.tags.trim().split(",")
   console.log(tags)
   
  productDB.editProduct(allData, tags,pId).then((d) => {
    if(req.body.image1_b64.length>0){
      image1 = req.body.image1_b64;
      const path1 = `./public/pimages/${d._id}-001.jpg`; 
      const base64Data1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path1, base64Data1, { encoding: 'base64' });
 
    }
     if(req.body.image2_b64.length>0){
      image2 = req.body.image2_b64;
      const path2 = `./public/pimages/${d._id}-002.jpg`;
      const base64Data2 = image2.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path2, base64Data2, { encoding: 'base64' });
   
    
    
    }
    if(req.body.image3_b64.length>0){
      image3 = req.body.image3_b64;
      const path3 = `./public/pimages/${d._id}-003.jpg`;
      const base64Data3 = image3.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path3, base64Data3, { encoding: 'base64' });
   
  
     
   
    }
     if(req.body.image4_b64.length>0){
      image4 = req.body.image4_b64;
      const path4 = `./public/pimages/${d._id}-004.jpg`;
      const base64Data4 = image4.replace(/^data:([A-Za-z-+/]+);base64,/, ''); 
      fs.writeFileSync(path4, base64Data4, { encoding: 'base64' });
    }
 
    res.redirect("/admin/view-allproduct")
  }).catch((err) => {
    res.redirect("/admin/add-product")
    console.log(err)
  })
   
})
 

// ..............delete product.....................
router.get("/delete-product/:id",(req,res)=>{
  let id = req.params.id;
   productDB.delteProduct(id).then((result)=>{
    let idOfItem = result._id;
    fs.unlink("./public/pimages/" +idOfItem + "-001.jpg",(err)=> {if(err){console.log(err)}})
    fs.unlink("./public/pimages/" +idOfItem + "-002.jpg",(err)=>{if(err){console.log(err)}})
    fs.unlink("./public/pimages/" +idOfItem + "-003.jpg",(err)=>{if(err){console.log(err)}})
    fs.unlink("./public/pimages/" +idOfItem + "-004.jpg",(err)=>{if(err){console.log(err)}})
    res.redirect("/admin/view-allproduct")
  }).catch((err)=>{
    console.log(err)
  })
})







// ..................delete product end..........

// ................user-data get method............................
router.get("/user-data", auth, (req, res) => {
  userDB.getAllUsers().then((data) => {
  
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
router.post("/user/change-status", auth,(req, res) => {
 
  userDB.changeStatus(req.body).then((data) => {
  
    let changeStatus = {
      status: data
    }
    res.json(changeStatus)
  })
})

// ................user-data get change status end.......................

// .............category section....................
router.get("/cat-manage",auth, (req, res) => {
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
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/catmanagement", {
      
      layout: "adminLayout",
      adminData: req.session.admin.details,
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
router.post("/main-section", auth,(req, res) => {
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
router.post("/add-subcat",auth, (req, res) => {

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

router.get("/del-cat/:section/:options/:item",auth, (req, res) => {
 
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

// ..........banner section .............
router.get("/add/home-banner",auth,(req,res)=>{
  productDB.getAllBanner().then((ban)=>{
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/homeBanner",{layout: "adminLayout",
    adminData: req.session.admin.details,
  adminStatus: true,
    banner:ban,
})
  }).catch((err)=>{
    console.log(err)
  })
  
})

router.post("/add/home-banner",auth,(req,res)=>{
     productDB.addBanner(req.body).then((result)=>{
      let image1 = req.body.image1_b64;
      const path1 = `./public/banners/${result._id}-001.jpg`;
      const base64Data1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path1, base64Data1, { encoding: 'base64' });
      res.redirect("/admin/add/home-banner")
   }).catch((err)=>{
     console.log(err)
   })
})

router.get("/delete/banner/:id",auth,(req,res)=>{
  let banId = req.params.id
 
  productDB.delteBanner(banId).then((result)=>{
    fs.unlink("./public/banners/" +banId + "-001.jpg",(err)=> {if(err){console.log(err)}})
    res.redirect("/admin/add/home-banner")
  }).catch((err)=>{
    console.log(err)
  })
})

// ........special banner..........

router.get("/add/special-banner",(req,res)=>{
  productDB.categorOnly().then((dataFetched)=>{
    let brand=[]
    let type=[]
    brand.push(...dataFetched[1])
    type.push(...dataFetched[2])
  productDB.getAllSpecialBanner().then((spBanner)=>{
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/specialOffer",{layout: "adminLayout",
    adminStatus: true, adminData: req.session.admin.details,brand,type,bannerData:spBanner})
  }).catch((err)=>{
    console.log(err)
  })
   
  }).catch((err)=>{
    console.log(err)
  })
  
})

router.post("/add/special-banner",auth,(req,res)=>{
  productDB.addSpecialBrand(req.body).then((savedData)=>{
    let image1 = req.body.image1_b64;
      const path1 = `./public/spbanner/${savedData._id}-001.jpg`;
      const base64Data1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path1, base64Data1, { encoding: 'base64' });
      res.redirect("/admin/add/special-banner")
  }).catch((err)=>{
    console.log(err)
  })
})


router.get("/delete/sp-banner/:id",auth,(req,res)=>{
  let spBannerId = req.params.id
  productDB.deleteSpBanner(spBannerId).then((result)=>{
    fs.unlink("./public/spbanner/" +spBannerId + "-001.jpg",(err)=> {if(err){console.log(err)}})
    res.redirect("/admin/add/special-banner")
  })
})

// .................order managent........................
router.get("/order-manage",auth,(req,res)=>{
  userDB.getAllOrders().then((result)=>{
    let orderData = result
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/orderDetails",{layout: "adminLayout",
    adminStatus: true,orderData, adminData: req.session.admin.details,})
  })
 
})
 

router.post("/change/order/status",auth,(req,res)=>{
  let orderId = req.body.oId;
  let productId = req.body.proId;
  let value = req.body.value;
 
  userDB.changeOrderStatus(orderId,productId,value).then((result)=>{
 
    res.json({status:true})
  })
})



router.post("/cancel/order/",(req,res)=>{
  let orderId = req.body.order;
  let productId = req.body.product;
  let userId = req.body.user;
  userDB.cancelOrder(userId,orderId, productId).then((result)=>{
     res.json({status:true})
  }).catch((err)=>{
    console.log(err)
  })
})

router.get("/user/oderdetails/:topic",auth,(req,res)=>{
  let user = req.params.topic;
  userDB.getOneUser(user).then((userData)=>{
    let userDetails = userData
   
    userDB.getUserOrder(user).then((result)=>{
      let orderDetails = result;
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
       res.render("admin/userOrders",{layout: "adminLayout",adminStatus: true, adminData: req.session.admin.details,userDetails,orderDetails})
    })
  })
 
})

router.get("/check-date/order",auth,(req,res)=>{
  console.log(req.query)
    userDB.getDataFilterd(req.query).then((result)=>{
      
      let orderData = result
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.render("admin/orderDetails",{layout: "adminLayout",
      adminStatus: true,orderData, adminData: req.session.admin.details,})
  })
   
})



router.get("/sales-report",auth,(req,res)=>{
  userDB.salesReport().then((result)=>{
    let  checkData = false;
    if(result.length!=0){
      checkData = true
    }
    let orderData = result
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/salesreport",{layout: "adminLayout",
    adminStatus: true,orderData,checkData, adminData: req.session.admin.details,})
  })
 
})


router.get("/sales-report/filter",(req,res)=>{
  userDB.salesReportFilter(req.query).then((result)=>{
    let  checkData = false;
    if(result.length!=0){
      checkData = true
    }
    let orderData = result
    
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/salesreport",{layout: "adminLayout",
    adminStatus: true,orderData, checkData,adminData: req.session.admin.details,})
}).catch((err)=>{
  console.log(err)  
})
})

// this is today report
router.get("/sales-report/today",auth,(req,res)=>{
  userDB.salesReportDaily().then((result)=>{
    let  checkData = false;
    if(result.length!=0){
      checkData = true
    }
    let orderData  = result
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.render("admin/salesreport",{layout: "adminLayout",
  adminStatus: true,orderData, checkData,adminData: req.session.admin.details,})
  })
  
})
// this is weekly report
router.get("/sales-report/weekly",auth,(req,res)=>{
  userDB.salesReportWeekly().then((result)=>{
    let  checkData = false;
    if(result.length!=0){
      checkData = true
    }
    let orderData  = result
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.render("admin/salesreport",{layout: "adminLayout",
  adminStatus: true,orderData,checkData, adminData: req.session.admin.details,})
  })
  
})

// this is monthly report
router.get("/sales-report/monthly",auth,(req,res)=>{
  userDB.salesReportMonthly().then((result)=>{
    let  checkData = false;
    if(result.length!=0){
      checkData = true
    }
    let orderData  = result
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.render("admin/salesreport",{layout: "adminLayout",
  adminStatus: true,orderData, checkData,adminData: req.session.admin.details,})
  })
  
})

// this is year report
router.get("/sales-report/yearly",auth,(req,res)=>{
  userDB.salesReportYearly().then((result)=>{
    let  checkData = false;
    if(result.length!=0){
      checkData = true
    }
    let orderData  = result
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.render("admin/salesreport",{layout: "adminLayout",
  adminStatus: true,orderData,checkData, adminData: req.session.admin.details,})
  })
  
})
 

/* this is for offer test */

router.get("/test",(req,res)=>{
  res.render("admin/productoffer",
  {layout: "adminLayout",
  adminStatus: true,})
})

/* this function for change product discount here I am taking the data to delete*/

router.get("/product-offer",auth,(req,res)=>{
  productDB.getAllProduct().then((result) => {
    let allproduct = result;
    let expProducts =[];
    let dateOftheDay = new Date()
  
    result.forEach((item)=>{
      if(item.ExpOffer !=null){
        let date = new Date(item.ExpOffer)
        if( date <= dateOftheDay  ){
          expProducts.push(item)
        }
      }
        
    })
 
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/productoffer", {
      layout: "adminLayout",
      adminStatus: true,
      allproduct,
      expProducts,
      adminData: req.session.admin.details
    })
  }).catch((err) => {
    console.log(err)
  })
}) 

/* this is for product offer adding throgh ajax */
router.post("/product-offer/add",auth,(req,res)=>{
  productDB.addProductOffer(req.body).then((result)=>{
    res.json(result)
  }).catch((err)=>{
    console.log(err)
  })
})

/* thsi function for delte the offer which expaired and put the values to discout */
router.post("/product-off/delete",auth,(req,res)=>{
  productDB.delteProductOffer(req.body).then((result)=>{
    console.log(result)
    res.json({status:true})
  })
})

/* this fucntion for category offer adding. now rendering the page with category */
router.get("/category/offer",auth,(req,res)=>{
  productDB.getAllCategory().then((result)=>{
    productDB.getCategoryExpireItems().then((expdatas)=>{
      console.log(expdatas)
      let expireData = expdatas
      let categoryData = result
      res.render("admin/categoryoffer",{
      layout: "adminLayout",
      adminStatus: true,categoryData,expireData,
      adminData: req.session.admin.details
    })
    })
    })
   
 })

 /* this function for adding category offer . here i am doing checking the dicount value of current that is greater than catoff then it will return nothing 
 else i will set the null value to the expOff that means product offer expire date and i will put the latest discount to the discount field and 
 new offer prize */
 router.post("/category/add/offer",auth,(req,res)=>{
   productDB.addCategoryOffer(req.body).then((result)=>{
      res.redirect("/admin/category/offer")
   })
 })
/* here am checking the the product matching to this category and set the catexpireDate to null and I will reset the old discount value to the discount field 
and the advantage is here that is if we are edited a product offer then that particular product willl not delete effect from this side */
router.post("/catergory/delete/offer",auth,(req,res)=>{
  productDB.deleteCategoryProdcut(req.body).then((result)=>{
    res.json({status:result})
  })
})


/* this function for creating coupen and viewving that coupen */

router.get("/create-coupen",auth,(req,res)=>{
  userDB.getAllCoupon().then((result)=>{
    var couponDetails = result
      console.log(couponDetails)
 
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.render("admin/createcoupen", {
      layout: "adminLayout",
      adminStatus: true,
      adminData: req.session.admin.details,
      couponDetails
       
    })
  })
 
})
/* this function belogns to add the offer to offer database  */
router.post("/create-coupen",auth,(req,res)=>{
   userDB.createCoupon(req.body).then((result)=>{
      res.json({status:true})
   }).catch((err)=>{
     res.json({status:false, msg:err})
   })
})

/* this function for delete coupen */

router.post("/delete/coupon",auth,(req,res)=>{
  console.log(req.body)
  userDB.deleteCoupon(req.body).then((result)=>{
    res.json({status:true})
  })
})
// ...........admin logout................
router.get("/account/logout", (req, res) => {
  delete req.session.admin
  res.redirect("/admin")
})



module.exports = router;