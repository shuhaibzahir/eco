var express = require('express');
 
var router = express.Router();
const userDB = require("../helper/userdb")
const client = require('twilio')(process.env.TWILIO_ID, process.env.TWILIO_TOKEN);
const productDB = require("../helper/product");
 
 const fs = require('fs');
 

// check authentication

function auth(req, res, next) {
    if (req.session.user) {
        let uid = req.session.user.uid
        userDB.getOneUser(uid).then((reslt)=>{
            if(reslt.status){
                req.session.user.status = reslt.status  
                req.session.user.cart = reslt.cart
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
   
    productDB.getBannersToHome().then((banners)=>{
         let {main, sp }= banners
         let banner = main;
         let spbanner = sp[0];
        
         if (req.session.user){
            let id = req.session.user.uid
           
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/main",{userLayout:true,usernav:req.session.user,banner,spbanner})
    
        }
    
        else{
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/main",{userLayout:true,banner,spbanner} )
        }
    
    }).catch((err)=>{
        console.log(err)
    })
  
      
});

router.get("/login", function (req, res) {
    
   if(req.session.user){
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.redirect("/")
   }else{
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
       res.render("userpages/userlogin",{userLayout:true})
   }
     
})

// user sign up form  post form 
router.post("/signup",  (req, res) => {
    // console.log(req.body);
    var todayDate = new Date().toLocaleDateString();
  
    let signUpStatus = {};
    userDB.userSignup(req.body,todayDate).then((data) => {
        signUpStatus = {
            status: true,
            msg: "successfully Registerd"
        }
        let demoUser = {
            uid: data._id,
            name: data.name,
            status: data.status,
            cart:data.cart,
            email :data.email,
            phone:data.phone,
            
        }
        req.session.user = demoUser
        
        //this is session assign 
        
        res.json(signUpStatus)
    }).catch((err) => {
        signUpStatus = {
            status: false,
            msg: err
        }
      
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
                status: user.status,
                cart:user.cart,
                email :user.email,
                phone:user.phone,
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

 
 
router.post("/otp-login", (req, res) => {
    let random = Math.floor(Math.random() * 1000000)
    let otpLoginStatus = {};
    userDB.checkPhone(req.body).then((user) => {
        req.session.otp={
            u_id:user._id,
            phoneNumber : user.phone,
            otpNum : random
        }   
        phone= req.session.otp.phoneNumber
        otp = req.session.otp.otpNum
        console.log(req.session.otp)
        client.messages
            .create({
                body: `Your Login Otp is ${otp}`,
                from: '+14233456669',
                to: `+91${phone}`
            })
            .then((message) => {
                console.log(message.sid);
            }).catch((err)=>{
                console.log(err)
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

//.................otp resending...............

 




//............... otp Submitting.............................
router.post("/otp-submit", (req, res) => {
    let otpSubmitStatus = {}
    let submittedOtp = req.body.otp;
    let previousOtp = req.session.otp.otpNum
    if (submittedOtp == previousOtp) {
        userDB.getOneUser(req.session.otp.u_id).then((userOne)=>{
            
            req.session.user = {
                uid: userOne._id,
                name: userOne.name,
                status: userOne.status,
                cart:userOne.cart,
                email :userOne.email,
                phone:userOne.phone,
            }
            delete  req.session.otp;
        
             
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

// ...................product view page .......

router.get("/allproduct",(req,res)=>{
   
    productDB.getAllProduct().then((result)=>{
        let allProduct = result
        if(req.session.user){
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/categorypage",{userLayout:true,allProduct,usernav:req.session.user,})
        }else{
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/categorypage",{userLayout:true,allProduct,})
        }
       
    }).catch((err)=>{
        console.log(err)
    })
})



router.get("/product/view/:id",(req,res)=>{
     
    let pid = req.params.id
    productDB.getOneProduct(pid).then((result)=>{
        let details = result
        if(req.session.user){
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/productview",{userLayout:true,details,usernav:req.session.user,})
        }else{
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/productview",{userLayout:true,details})
        }
     })
    
})
 //............................................stering cart.............................
 router.post("/addto-cart",(req,res)=>{
     
    if(req.session.user){
        let uid= req.session.user.uid
        let  pid=req.body.productID;
         
        console.log("this id user id "+ uid)
        console.log("this is product Id "+ pid)
        userDB.addToCart(uid,pid).then((result)=>{
            console.log(result)
        req.session.user.cart= result.userData.cart
        res.json({status:result.status})    
        
    }).catch((err)=>{
        console.log("ha its coming here")
        res.json({status:"Noqty"})    
    })
    }else{
        res.json({status:"notLoginned"})
    }
    
 })

  

 //............................................ending cart...............................

//  .................................cart view.............................................

router.get("/view-cart",auth,(req,res)=>{
    let id = req.session.user.uid
    userDB.getCartProduct(id).then((result)=>{
       let productData = result
        let subtotal=0;
        let shipCharge = 0;
        result.forEach((item)=>{
            subtotal += item.total 
        })
        if(subtotal > 3000){
            shipCharge=0;
        }else{
            shipCharge=120;
        }
        let grandTotal = subtotal +shipCharge;

        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.render("userpages/cartview",{userLayout:true,usernav:req.session.user,productData,subtotal,shipCharge,grandTotal})
    }) 
  
}) 
// .................................cart view end..........................................
// .................................delete cart daata.........................

router.get("/delete/cart-item/:pid",auth,(req,res)=>{
    let proId = req.params.pid
    let uid = req.session.user.uid
    userDB.deleteCartItem(uid,proId).then((result)=>{
        res.redirect("/view-cart")
    })
})
// ..............................delete cart data end...............................

 //...............count increment and decrement...............

 router.post("/cart/item/qty/chng",(req,res)=>{
     if(req.session.user){
        let productId = req.body.productId;
        let Quantity = parseInt(req.body.Quantity)
        let user = req.session.user.uid;
       
        userDB.changeQty(user,productId,Quantity).then((result)=>{
            let jsonData={}
        result.cart.forEach(element => {
           if( element.pid==productId){
            jsonData={qty:element.qty,status:true}
           }

        });
        res.json(jsonData)
     })
     }else{
        jsonData={status:false}
         res.json(jsonData)
     }
     
 })

 
 //..............count increment adn decrement end................

// ....................Oreder Section............................

// 1 check out address
 router.get("/checkout", auth,(req,res)=>{
     let user = req.session.user.uid
     userDB.getOneUser(user).then((data)=>{
         if(data.cart.length >0){
        let userAddData = data
          let uid = userAddData._id
           let address = data.address
           
         userDB.getCartProduct(user).then((result)=>{

            let itemCount = 0;
            let subtotal=0;
            let shipCharge = 0;
            result.forEach((item)=>{
                subtotal += item.total 
                itemCount++;
            })
            if(subtotal > 3000){
                shipCharge=0;
            }else{
                shipCharge=120;
            }

            let grandTotal = subtotal +shipCharge;
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/checkoutAddress",{userLayout:true,
                usernav:req.session.user,
                uid,
                userAddData,
                itemCount,
                subtotal,
                shipCharge,
                grandTotal,
                address
            
            })
            
         })
         }else{
             res.redirect("/allproduct")
         }
     })
     
    
 })
 
 //2 get the saved Address 
 router.post("/get-address",auth,(req,res)=>{
        let id = req.session.user.uid;
        let addname = req.body.addName;
        let jsonData ;
        userDB.getAddress(id,addname).then((address)=>{
        
          let add= address
          jsonData ={status:true, d:add}
          res.json(jsonData)
     }).catch((err)=>{
        jsonData ={status:false, msg:err}
        res.json(jsonData)
     })
 })



 //3 checkout post address 
 router.post("/checkout",(req,res)=>{

        let savingAdd = Boolean(req.body.saveaddress);
        
        let userId = req.session.user.uid
        let paymentMethod = req.body.payment_method;
        let billAddress = {
          AddressName:req.body.Adname,
          FirstName:req.body.Fname,
          LastName : req.body.Lname,
          HouseNo: req.body.Houseno,
          Address:req.body.Address,
          Town: req.body.Town,
          State:req.body.State,
          Pincode:req.body.Post,
          Phone: req.body.Phone
      }
       
        
         userDB.addingOrder(userId,billAddress,paymentMethod,savingAdd).then((result)=>{
            
            req.session.user.order = result
            res.redirect("/payment/succcess")
       
      }).catch((err)=>{
          console.log(err)
      })
       
  
 })

 
// ....................................Order colllection....................


router.get("/payment/succcess",auth,(req,res)=>{
    if(req.session.user.order){
        var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let delivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", options);
         let orderDetails = req.session.user.order
        let grandTotal =req.session.user.order.totalOfOrder + req.session.user.order.shippingCharg 
 
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.render("userpages/ordersuccess",{userLayout:true, usernav:req.session.user,orderDetails,delivery,grandTotal})
        delete req.session.user.order
    }else{
        res.redirect("/allproduct")
    }
   
})

// ...............................profile.............


router.get("/myaccount",auth,(req,res)=>{

    userDB.getOneUser(req.session.user.uid).then((data)=>{
        let address = data.address;
        userDB.getUserOrder(req.session.user.uid).then((orders)=>{
             console.log(orders[0].products[0])
            res.render("userpages/userProfile",{userLayout:true,usernav:req.session.user,address,orders})
        })

        
       
    })
   
})


router.post("/changeprofile",auth,(req,res)=>{
     let uid = req.session.user.uid
     let image1 = req.body.image1_b64;
      const path1 = `./public/images/userimage/${uid}-001.jpg`;
      const base64Data1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      fs.writeFileSync(path1, base64Data1, { encoding: 'base64' });
      res.redirect("/myaccount")
})

 

router.get("/change/address/:address",auth,(req,res)=>{
    let id = req.session.user.uid
    let add = req.params.address
  
    userDB.getAddress(id,add).then((adrs)=>{
        
        res.render("userpages/addressEdit",{userLayout:true,usernav:req.session.user,adrs})
    })
   
})

router.post("/update/address",auth,(req,res)=>{
    let billAddress = {
        AddressName:req.body.Adname,
        FirstName:req.body.Fname,
        LastName : req.body.Lname,
        HouseNo: req.body.Houseno,
        Address:req.body.Address,
        Town: req.body.Town,
        State:req.body.State,
        Pincode:req.body.Post,
        Phone: req.body.Phone
    }
    let uid = req.session.user.uid;
    let ogName = req.body.orginalName;
    userDB.addAddressToUser(uid, billAddress,ogName).then((result)=>{
        console.log(result)
        res.redirect("/myaccount")
    })
 
})

router.get("/delete/address/:topic",auth,(req,res)=>{
    let uid = req.session.user.uid;
    let addname = req.params.topic;
    userDB.deleteAddress(uid,addname).then((result)=>{
        console.log(result)
        res.redirect("/myaccount")
    })
})

router.post("/user/update/profile",(req,res)=>{
    let uid = req.session.user.uid;
    let updateDta = {
     name : req.body.userFullname,
     email: req.body.email,
     phone :req.body.phone
    }
    userDB.updateUserDetail(uid, updateDta).then((result)=>{
        res.json({status:true})
    }).catch((err)=>{
        res.json({status:false, msg:err})
    })
       
             
})



router.post("/user/order/cancel",auth,(req,res)=>{
    let orderId = req.body.order;
    let productId = req.body.product;
    let userId = req.session.user.uid;
    userDB.cancelOrder(userId,orderId, productId).then((result)=>{
       res.json({status:true})
    }).catch((err)=>{
      console.log(err)
    })
})
 

//..............................profile end 
router.get("/logout",(req,res)=>{
    delete req.session.user;
    res.redirect("/")
})

 
 
// router.get("/test",(req,res)=>{
//     res.render("userpages/ordersuccess",{userLayout:true, })
// })

 
module.exports = router;