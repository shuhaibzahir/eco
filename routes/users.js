var express = require('express');
var router = express.Router();
const userDB = require("../helper/userdb")
const client = require('twilio')(process.env.TWILIO_ID, process.env.TWILIO_TOKEN);
const productDB = require("../helper/product");
const fs = require('fs');
var randomstring = require("randomstring");
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const facebook = require('passport-facebook');

/* this is for nodemailer */
const nodemailer = require("nodemailer");

/* this is sendgrid initialize */
// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENGRID_API_KEY)

/* this is paypal requirement and integration */
const paypal = require('paypal-rest-sdk');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ARoYJM5TlLnbW_obs-p-JBW2hgJGBhXDwsNZNFztKUMXUGLWLkFtwTRQFSr_SlWlc80mald6aajEg7fe',
    'client_secret': 'EJaFG21D-xtSSzc2L8xyVwGQ6eNyOcHcUP3Cyym9iKdhdbIUZTqbtztTZCOq2lLHzwP-6ikex97lLqIS'
});



/* this function for google authentication and googel login  here I am not keeping the data in to passport sesion directly i am adding to the database*/
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "http://localhost:3000/auth/google/success"
    },
    (accessToken, refreshToken, profile, cb) => {
        userDB.googelLogin(profile).then((result) => {
            return cb(null, profile);
        })

    }));


passport.use(new facebook.Strategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/facebook/callback'
    },
    (accessToken, refreshToken, profile, cb) => {
        console.log(profile)
        return cb(null, profile);
    }));



passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});
/* the google authication I removed the passport the i directly adding the data to the database and the I store the data to the session 
 */
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));
router.get('/auth/google/success',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req, res, next) => {
        userDB.getOneuserbyGoogleId(req.user).then((data) => {
            console.log("this is data from users js", data)
            let demoUser = {
                uid: data._id,
                name: data.name,
                status: data.status,
                cart: data.cart,
                email: data.email || "",
                phone: data.phone || "",
                referalStatus: data.referalStatus
            }
            //this is session assign
            req.session.user = demoUser
            let redirect = req.session.redirect
            res.redirect(redirect || '/');
        })

    });


/* these function for facebook login and here you can see my database first I request to facebook and then they will ask for login
after you are authenticated then it will save to passport session after that it will come callback url then i will store to database
then only I am deleting the passport session from there */
router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login'
    }),
    (req, res, next) => {
        userDB.getOneuserbyFacebook(req.session.passport).then((data) => {
            delete req.session.passport
            let demoUser = {
                uid: data._id,
                name: data.name,
                status: data.status,
                cart: data.cart,
                email: data.email || "",
                phone: data.phone || "",
                referalStatus: data.referalStatus
            }
            //this is session assign
            req.session.user = demoUser
            let redirect = req.session.redirect
            res.redirect(redirect || '/');
        })

    });

/* authentication funtion */
function auth(req, res, next) {
    if (req.session.user) {
        let uid = req.session.user.uid
        userDB.getOneUser(uid).then((reslt) => {
            if (reslt) {

                if (reslt.status) {
                    req.session.user.status = reslt.status
                    req.session.user.name = reslt.name
                    req.session.user.email = reslt.email
                    req.session.user.phone = reslt.phone
                    req.session.user.cart = reslt.cart

                    next();
                } else {
                    delete req.session.user;
                    res.redirect("/login")
                }
            } else {
                res.redirect("/login")
            }
        }).catch((err) => {
            console.log(err) //console the error herein
            res.redirect("/login")
        })
    } else {
        res.redirect("/login")
    }
}



/* this is main home page when we enterd to the website*/
router.get("/", function (req, res) {
    productDB.getBannersToHome().then((banners) => {
        let {
            main,
            sp
        } = banners
        let banner = main;
        let spbanner = sp[0];

        if (req.session.user) {
            let id = req.session.user.uid

            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/main", {
                userLayout: true,
                usernav: req.session.user,
                banner,
                spbanner
            })

        } else {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/main", {
                userLayout: true,
                banner,
                spbanner
            })
        }

    }).catch((err) => {
        console.log(err)
    })


});

/* login page for user */
router.get("/login", function (req, res) {
    let redirect = req.headers.referer || req.originalUrl || req.url
    req.session.redirect = redirect
    if (req.session.user) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.redirect("/")
    } else {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.render("userpages/userlogin", {
            userLayout: true
        })
    }

})

/* sign up page */
router.post("/signup", (req, res) => {
    var todayDate = new Date().toLocaleDateString();
    let redirect = req.session.redirect
    let signUpStatus = {};
    userDB.userSignup(req.body, todayDate).then((data) => {
        signUpStatus = {
            status: true,
            url: redirect
        }
        let demoUser = {
            uid: data._id,
            name: data.name,
            status: data.status,
            cart: data.cart,
            email: data.email,
            phone: data.phone,
            referalStatus: data.referalStatus
        }
        //this is session assign
        req.session.user = demoUser

        res.json(signUpStatus)
    }).catch((err) => {
        signUpStatus = {
            status: false,
            msg: err
        }

        res.json(signUpStatus)
    })
})


/* this function for password reset */
router.post("/forgot-password", (req, res) => {
    let host = req.headers.host
    let userEmail = req.body.email;
    var randomChar = randomstring.generate({
        length: 12,
        charset: 'alphabetic'
    });
    console.log(randomChar)
    let link = `http://${host}/reset/${randomChar}`

    req.session.forgot = {
        email: userEmail,
        token: randomChar
    }


    /* this is nodemailer setup */
    let mailTransporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'shuhaib.web@gmail.com',
            pass: '9048268028.'
        }
    });

    userDB.emailChek(userEmail).then((result) => {
        let mailDetails = {
            from: 'shuhaib.web@gmail.com',
            to: `${userEmail}`,
            subject: 'Reset Password Here',
            text: `Here is the link you can click here ${link}`,
            html: `<srong>Here is the link you can click here </strong><br><a href="${link}" style="padding:10px 20px; background:yellow; color:black; text-decoration:none; font-weight:bold;">Your Link</a>  `
        };
        mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
                res.json({
                    status: false,
                    msg: "some error please try again later"
                })
                console.log('Error Occurs');
            } else {
                res.json({
                    status: true
                })
                console.log('Email sent successfully');
            }
        });


    }).catch((err) => {
        res.json({
            status: false,
            msg: "please enter registered email"
        })
    });

})


/* this is function for reset the password  rendering the form*/

router.get("/reset/:token", (req, res) => {
    if (req.session.forgot) {
        let token = req.params.token;
        let verifyToken = req.session.forgot.token
        if (token == verifyToken) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/resetpassword", {
                userLayout: true
            })
        } else {
            res.redirect("/")
        }
    } else {
        res.redirect("/")
    }

})

/* thsi is function for reset password post method */
router.post("/reset-password", (req, res) => {
    let userEmail = req.session.forgot.email
    let password = req.body.new_password
    userDB.resetPassword(userEmail, password).then(() => {
        res.json({
            status: true
        })
    }).catch((err) => {
        console.log(err)
        res.json({
            status: false
        })
    })
})


/* this is sign in form for user post method */
router.post("/sign-in", (req, res) => {
    let redirect = req.session.redirect
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
                url: redirect
            }
            let demoUser = {
                uid: user._id,
                name: user.name,
                status: user.status,
                cart: user.cart,
                email: user.email,
                phone: user.phone,
                referalStatus: user.referalStatus
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




/* OTP login with twilio */
router.post("/otp-login", (req, res) => {
    let random = Math.floor(Math.random() * 1000000)
    let otpLoginStatus = {};
    userDB.checkPhone(req.body).then((user) => {
        req.session.otp = {
            u_id: user._id,
            phoneNumber: user.phone,
            otpNum: random
        }
        phone = req.session.otp.phoneNumber
        otp = req.session.otp.otpNum

        client.messages
            .create({
                body: `Your Login Otp is ${otp}`,
                from: '+14233456669',
                to: `+91${phone}`
            })
            .then((message) => {
                console.log(message.sid);
            }).catch((err) => {
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


//............... otp Submitting.............................
router.post("/otp-submit", (req, res) => {
    let otpSubmitStatus = {}
    let redirect = req.session.redirect
    let submittedOtp = req.body.otp;
    let previousOtp = req.session.otp.otpNum
    if (submittedOtp == previousOtp) {
        userDB.getOneUser(req.session.otp.u_id).then((userOne) => {
            req.session.user = {
                uid: userOne._id,
                name: userOne.name,
                status: userOne.status,
                cart: userOne.cart,
                email: userOne.email,
                phone: userOne.phone,
                referalStatus: userOne.referalStatus
            }
            delete req.session.otp;

            // setted session and sending ajax response
            otpSubmitStatus = {
                status: true,
                url: redirect
            }
            res.json(otpSubmitStatus)

        }).catch((err) => {
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

/* all products page */

router.get("/allproduct", (req, res) => {
  
    let wantskip = req.query.next || 0
    console.log(wantskip, "this is skipping value")
    productDB.getAllProduct(wantskip).then((result, count) => {
        let skipping = parseInt(wantskip) + 6
        let chekckButton = true;
        let prevBtn = true
        if (skipping < result.c) {
            skipping = parseInt(wantskip) + 6

        } else {
            skipping = result.c
            chekckButton = false
        }
        let nexturl = `/allproduct?next=${skipping}`
        if (wantskip < 6) {
            prevBtn = false
        }
        let prviouValue = parseInt(wantskip) - 6
        let prevUrl = `/allproduct?next=${prviouValue}`


        let allProduct = result.re

        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.render("userpages/categorypage", {
            userLayout: true,
            allProduct,
            usernav: req.session.user,
            nexturl,
            prevUrl,
            chekckButton,
            prevBtn
        })


    }).catch((err) => {
        console.log(err)
    })
})


/* this is for one product view*/
router.get("/product/view/:id", (req, res) => {

    let pid = req.params.id
    productDB.getOneProduct(pid).then(async (result) => {
        let reviews;
        await userDB.getRealtedReview(pid).then((rev) => {
            reviews = rev
        })
        console.log(reviews)
        productDB.getMatchingProduct(result.Type, result.Department).then((data) => {
            console.log(data)
            let similiar = []
            similiar = data
            let details = result
            if (req.session.user) {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.render("userpages/productview", {
                    userLayout: true,
                    details,
                    similiar,
                    reviews,
                    usernav: req.session.user,
                })
            } else {
                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.render("userpages/productview", {
                    userLayout: true,
                    details,
                    reviews,
                    similiar
                })
            }
        })


    })

})
/* storing data to cart*/
router.post("/addto-cart", (req, res) => {

    if (req.session.user) {
        let uid = req.session.user.uid
        let pid = req.body.productID;
        userDB.addToCart(uid, pid).then((result) => {
            req.session.user.cart = result.userData.cart
            res.json({
                status: result.status
            })

        }).catch((err) => {
            res.json({
                status: "Noqty"
            })
        })
    } else {
        res.json({
            status: "notLoginned"
        })
    }

})




/* view cart */

router.get("/view-cart", auth, (req, res) => {
    let id = req.session.user.uid
    userDB.getCartProduct(id).then((result) => {

        let productData = result
        let subtotal = 0;
        let shipCharge = 0;
        let referal = 0;

        if (req.session.user.referalStatus) {

            referal = 30;
        } else {
            referal = 0;
        }
        result.forEach((item) => {
            subtotal += item.total
        })
        if (subtotal > 3000) {
            shipCharge = 0;
        } else {
            shipCharge = 120;
        }
        let grandTotal = subtotal + shipCharge - referal;

        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.render("userpages/cartview", {
            userLayout: true,
            usernav: req.session.user,
            productData,
            subtotal,
            shipCharge,
            grandTotal,
            referal
        })
    })

})


/* delete cart data*/
router.get("/delete/cart-item/:pid", auth, (req, res) => {
    let proId = req.params.pid
    let uid = req.session.user.uid
    userDB.deleteCartItem(uid, proId).then((result) => {
        res.redirect("/view-cart")
    })
})


/* cart item quantity change */

router.post("/cart/item/qty/chng", (req, res) => {
    if (req.session.user) {
        let productId = req.body.productId;
        let Quantity = parseInt(req.body.Quantity)
        let user = req.session.user.uid;

        userDB.changeQty(user, productId, Quantity).then((result) => {
            let jsonData = {}
            result.cart.forEach(element => {
                if (element.pid == productId) {
                    jsonData = {
                        qty: element.qty,
                        status: true
                    }
                }

            });
            res.json(jsonData)
        })
    } else {
        jsonData = {
            status: false
        }
        res.json(jsonData)
    }

})




/* chekout function  */
router.get("/checkout", auth, (req, res) => {
    let user = req.session.user.uid
    delete req.session.user.coupon
    userDB.getOneUser(user).then((data) => {

        if (data.cart.length > 0) {
            let userAddData = data
            let uid = userAddData._id
            let address = data.address
            let pocketMoney = 0;
            console.log(data.referalEarnings)
            if (data.referalEarnings > 20) {
                pocketMoney = Math.round((data.referalEarnings / 100) * 30)
            } else if (!data.referalEarnings) {
                pocketMoney = 0
            } else {
                pocketMoney = data.referalEarnings
            }
            let referalStaus = data.referalStatus
           

            req.session.user.pocket = pocketMoney

            userDB.getCartProduct(user).then((result) => {

                let itemCount = 0;
                let subtotal = 0;
                let shipCharge = 0;
                result.forEach((item) => {
                    subtotal += item.total
                    itemCount++;
                })

                let referal = 0;

                if (referalStaus) {
                    /* the referal status making true becuase if payment faild then i can check this status is true then i need to give him the referal bounus */
                    req.session.user.referalSecure = true;
                    referal = 30;
                } else {
                    referal = 0;
                }
                if (subtotal > 3000) {
                    shipCharge = 0;
                } else {
                    shipCharge = 120;
                }

                let grandTotal = subtotal + shipCharge - referal - pocketMoney;
                req.session.user.grandtotal = grandTotal

                res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
                res.render("userpages/checkoutAddress", {
                    userLayout: true,
                    usernav: req.session.user,
                    uid,
                    userAddData,
                    itemCount,
                    subtotal,
                    shipCharge,
                    grandTotal,
                    address,
                    referal,
                    pocketMoney,

                })

            })
        } else {
            res.redirect("/allproduct")
        }
    })


})

/* get user address */
router.post("/get-address", auth, (req, res) => {
    let id = req.session.user.uid;
    let addname = req.body.addName;
    let jsonData;
    userDB.getAddress(id, addname).then((address) => {

        let add = address
        jsonData = {
            status: true,
            d: add
        }
        res.json(jsonData)
    }).catch((err) => {
        jsonData = {
            status: false,
            msg: err
        }
        res.json(jsonData)
    })
})

router.get("/coupon-chek", (req, res) => {

    let user = req.session.user.uid
    let grand = req.session.user.grandtotal
    delete req.session.user.coupon
    userDB.checkCoupon(req.query, user).then((result) => {
        if (grand > result.minpurchase) {

            let offerAmount = Math.round((grand / 100) * result.dicount)
            if (offerAmount <= result.maxamount) {
                offerAmount = offerAmount
            } else {
                offerAmount = result.maxamount
            }
            req.session.user.coupon = result.couponName
            res.json({
                status: true,
                off: offerAmount
            })
        } else {
            res.json({
                status: false,
                msg: `You can't apply this coupon. Minimum purchase ${result.minpurchase}`
            })
        }
    }).catch((err) => {
        res.json({
            status: false,
            msg: err
        })
    })
})

/*  adding the order to order collections */
router.post("/checkout", auth, (req, res) => {

    let savingAdd = Boolean(req.body.saveaddress);

    let userId = req.session.user.uid
    let paymentMethod = req.body.payment_method;

    let billAddress = {
        AddressName: req.body.Adname,
        FirstName: req.body.Fname,
        LastName: req.body.Lname,
        HouseNo: req.body.Houseno,
        Address: req.body.Address,
        Town: req.body.Town,
        State: req.body.State,
        Pincode: req.body.Post,
        Phone: req.body.Phone
    }
    let referal = 0;

    if (req.session.user.referalStatus) {

        referal = 30;
    } else {
        referal = 0;
    }
    let pocketMoney = req.session.user.pocket
    let couponcode = ""
    if (req.session.user.coupon) {
        couponcode = req.session.user.coupon
    } else {
        couponcode = ""
    }
    userDB.addingOrder(userId, billAddress, paymentMethod, savingAdd, referal, pocketMoney, couponcode).then((result) => {
        req.session.user.order = result

        if (paymentMethod == "cashonDelivery") {
            res.json({
                status: "cash"
            })
        } else if (paymentMethod == "Razorpay") {
            userDB.genrateRazerPay(result).then((payment) => {
                res.json({
                    status: "Razorpay",
                    payment,
                    key: process.env.RKEY,
                    user: req.session.user
                })
            })
        } else if (paymentMethod == "Paypal") {

            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/payment-payapl/success",
                    "cancel_url": "http://localhost:3000/failed-payment"
                },
                "transactions": [{

                    "amount": {
                        "currency": "USD",
                        "total": result.totalOfOrder
                    },
                    "description": "Hat for the best team ever"
                }]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {

                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            res.json({
                                status: "paypal",
                                paypalUrl: payment.links[i].href
                            })
                        }
                    }
                }
            });
        }
    }).catch((err) => {
        console.log(err)
    })


})

/* verify payment from paypal an razorpay */
router.post("/verify-payment", auth, (req, res) => {
    userDB.verifyPayment(req.body).then((result) => {
        let status = 'PAID'
        let user = req.session.user.uid
        userDB.changePaymentStatus(result, status, user).then((conf) => {
            console.log(conf)
            let pyStatus = {
                pyst: true
            }
            res.json(pyStatus)
        })
    }).catch((err) => {

        console.log(err)

    })
})

/* failed payment then this function will execute
and it will re send the item into cart and product collection also */
router.post("/failed-payment", auth, (req, res) => {
    if (req.session.user.order) {
        let order = req.session.user.order
        let user = req.session.user.uid
        let coupon = req.session.user.coupon
        userDB.cancelOrderOfPaymentFaild(order, user, coupon).then((result) => {
            if (req.session.user.referalSecure) {
                userDB.referalSecure(req.session.user.uid).then(() => {
                    console.log("updated")
                })
            }
            res.json({
                status: true
            })
            delete req.session.user.order
        })
    } else {
        res.redirect("/allproduct")
    }

})

/* this is the razorpay payment faild get request */
router.get("/failed-payment", (req, res) => {
    if (req.session.user.order) {
        let order = req.session.user.order
        userDB.cancelOrderOfPaymentFaild(order).then((result) => {
            if (req.session.user.referalSecure) {
                userDB.referalSecure(req.session.user.uid).then(() => {
                    console.log("updated")
                })
            }
            res.redirect("/view-cart")
            delete req.session.user.order
        })
    } else {
        res.redirect("/allproduct")
    }

})


/*  payment paypal success */
router.get("/payment-payapl/succcess", auth, (req, res) => {
    if (req.session.user.order) {
        req.session.user.referalStatus = false
        delete req.session.user.referalSecure
        let order = req.session.user.order._id
        let status = 'PAID'
        let user = req.session.user.uid
        userDB.changePaymentStatus(order, status, user).then((conf) => {
            res.redirect("/payment/success")
        })
    } else {
        res.redirect("/allproduct")
    }

})


/*  payment  success this is */
router.get("/payment/success", auth, (req, res) => {
    if (req.session.user.order) {
        req.session.user.referalStatus = false
        delete req.session.user.referalSecure
        var options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        let delivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", options);
        let orderDetails = req.session.user.order
        let grandTotal = req.session.user.order.totalOfOrder

        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.render("userpages/ordersuccess", {
            userLayout: true,
            usernav: req.session.user,
            orderDetails,
            delivery,
            grandTotal
        })
        delete req.session.user.order
    } else {
        res.redirect("/allproduct")
    }

})

/* this is user account  */
router.get("/myaccount", auth, (req, res) => {

    userDB.getOneUser(req.session.user.uid).then((data) => {
        let address = data.address;
        let userReferal = data.referalId

        let referalEarnings = data.referalEarnings

        userDB.getUserOrder(req.session.user.uid).then((orders) => {

            res.render("userpages/userProfile", {
                userLayout: true,
                usernav: req.session.user,
                address,
                orders,
                userReferal,
                referalEarnings
            })
        })

    })

})

/* change profile image . here use can change profile */
router.post("/changeprofile", auth, (req, res) => {
    let uid = req.session.user.uid
    let image1 = req.body.image1_b64;
    const path1 = `./public/images/userimage/${uid}-001.jpg`;
    const base64Data1 = image1.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(path1, base64Data1, {
        encoding: 'base64'
    });
    res.redirect("/myaccount")
})


/* user password change odl to new */
router.post("/user-pass/change", (req, res) => {


    let user = req.session.user.uid
    let oldPass = req.body.oldpass
    let newPass = req.body.newpass
    userDB.changePassword(user, oldPass, newPass).then((result) => {
        console.log(result)
        res.json({
            status: true
        })
    }).catch((err) => {
        res.json({
            status: false,
            msg: err
        })
    })
})





/* user can change address. this is get address to address edit */
router.get("/change/address/:address", auth, (req, res) => {
    let id = req.session.user.uid
    let add = req.params.address

    userDB.getAddress(id, add).then((adrs) => {

        res.render("userpages/addressEdit", {
            userLayout: true,
            usernav: req.session.user,
            adrs
        })
    })

})

/* update user address and store into user collection */
router.post("/update/address", auth, (req, res) => {
    let billAddress = {
        AddressName: req.body.Adname,
        FirstName: req.body.Fname,
        LastName: req.body.Lname,
        HouseNo: req.body.Houseno,
        Address: req.body.Address,
        Town: req.body.Town,
        State: req.body.State,
        Pincode: req.body.Post,
        Phone: req.body.Phone
    }
    let uid = req.session.user.uid;
    let ogName = req.body.orginalName;
    userDB.addAddressToUser(uid, billAddress, ogName).then((result) => {
        console.log(result)
        res.redirect("/myaccount")
    })

})
/* delete address of user, here the address will delete from user's collections */
router.get("/delete/address/:topic", auth, (req, res) => {
    let uid = req.session.user.uid;
    let addname = req.params.topic;
    userDB.deleteAddress(uid, addname).then((result) => {
        console.log(result)
        res.redirect("/myaccount")
    })
})

/* user can Update his Basic porfile information */
router.post("/user/update/profile", (req, res) => {
    let uid = req.session.user.uid;
    let updateDta = {
        name: req.body.userFullname,
        email: req.body.email,
        phone: req.body.phone
    }
    userDB.updateUserDetail(uid, updateDta).then((result) => {
        res.json({
            status: true
        })
    }).catch((err) => {
        res.json({
            status: false,
            msg: err
        })
    })


})


/* user can cancle the order  */
router.post("/user/order/cancel", auth, (req, res) => {
    let orderId = req.body.order;
    let productId = req.body.product;
    let userId = req.session.user.uid;
    userDB.cancelOrder(userId, orderId, productId).then((result) => {
        res.json({
            status: true
        })
    }).catch((err) => {
        console.log(err)
    })
})

/* product searching  get request*/

router.get("/product/search", (req, res) => {
    if(req.query){
        let wantskip = req.query.next ||0
        if(wantskip <0){
            wantskip = 0
        }
        productDB.productSearch(req.query,wantskip).then((result) => {
            let skipping = parseInt(wantskip) + 6
            let chekckButton = true;
            let prevBtn = true;
            if (skipping < result.c) {
                skipping = parseInt(wantskip) + 6

            } else {
                skipping = result.c
                chekckButton = false
            }
             
            if (wantskip < 6) {
                prevBtn = false
            }

            let nexturl = `/product/search?keyword=${req.query.keyword}&next=${skipping}`
            let prviouValue = parseInt(wantskip) - 6
            let prevUrl = `/product/search?keyword=${req.query.keyword}&next=${prviouValue}`


            let allProduct = result.re
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/categorypage", {
                userLayout: true,
                allProduct,
                usernav: req.session.user,
                nexturl,
                prevUrl,
                prevBtn,
                chekckButton

            })
    
        })
    }else{
        res.redirect("/allproduct")
    }
    
})

/*  this is for category getting */

router.get("/product/cat/search", (req, res) => {
   
     if (req.query.mood && req.query.dep) {
        let wantskip = req.query.next || 0

        if(wantskip <0){
            wantskip =0
        }

         productDB.getCategoryProduct(req.query, wantskip).then((result) => {
            let skipping = parseInt(wantskip) + 6
            let chekckButton = true;
            let prevBtn = true
            if (skipping < result.c) {
                skipping = parseInt(wantskip) + 6

            } else {
                skipping = result.c
                chekckButton = false
            }

            if (wantskip < 6) {
                prevBtn = false
            }
            let nexturl = `/product/cat/search?mood${req.query.mood}&dep${req.query.dep}&next=${skipping}`
            let prviouValue = parseInt(wantskip) - 6
            let prevUrl = `/product/cat/search?mood${req.query.mood}&dep${req.query.dep}&next=${prviouValue}`


            let allProduct = result.re
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/categorypage", {
                userLayout: true,
                allProduct,
                usernav: req.session.user,
                nexturl,
                prevUrl,
                chekckButton,
                prevBtn

            })
        })
    } else {
        res.redirect("/allproduct")
    }
})

/* this function for getting the footwear for user */

router.get("/product/:topic/search", (req, res) => {
    if (req.query.dep) {
        let wantskip = req.query.next ||0
        if(wantskip <0){
            wantskip =0
        }
        productDB.getFootOrWatch(req.params.topic, req.query,wantskip).then((result) => {
            let skipping = parseInt(wantskip) + 6
            let chekckButton = true;
            let prevBtn = true;
            if (skipping < result.c) {
                skipping = parseInt(wantskip) + 6

            } else {
                skipping = result.c
                chekckButton = false
            }
             
            if (wantskip < 6) {
                prevBtn = false
            }

            let nexturl = `/product/${req.params.topic}/search?dep=${req.query.dep}$next=${skipping}`
            let prviouValue = parseInt(wantskip) - 6
            let prevUrl = `/product/${req.params.topic}/search?dep=${req.query.dep}&next=${prviouValue}`


            let allProduct = result.re
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/categorypage", {
                userLayout: true,
                allProduct,
                usernav: req.session.user,
                chekckButton,
                prevBtn,
                nexturl,
                prevUrl

            })

        })
    } else {
        res.redirect("/allproduct")
    }
})




/* this is for customer rating */
router.get("/rating/product/:topic", auth, (req, res) => {
    let product = req.params.topic
    productDB.getOneProduct(product).then((result) => {
        let details = result;
        userDB.getReview(product, req.session.user.uid).then((data) => {
            let reviewData = data
            res.render("userpages/ratingpage", {
                userLayout: true,
                usernav: req.session.user,
                reviewData,
                details

            })
        })

    })


})
/* special offer of main banner in home banner */
router.get("/special/off/", (req, res) => {
    if (req.query) {
        let wantskip = req.query.next ||0
         if(wantskip < 0){
             wantskip =0
         }
        productDB.getSpecialBannerProduct(req.query,wantskip).then((result) => {
            let skipping = parseInt(wantskip) + 6
            let chekckButton = true;
            let prevBtn = true;
            if (skipping < result.c) {
                skipping = parseInt(wantskip) + 6

            } else {
                skipping = result.c
                chekckButton = false
            }
             
            if (wantskip < 6) {
                prevBtn = false
            }

            let nexturl = `/special/off/?section=${req.query.section}&dep=${req.query.dep}&discount=${req.query.discount}&disend=${req.query.disend}&next=${skipping}`
            let prviouValue = parseInt(wantskip) - 6
            let prevUrl = `/special/off/?section=${req.query.section}&dep=${req.query.dep}&discount=${req.query.discount}&disend=${req.query.disend}&next=${prviouValue}`


            let allProduct = result.re 

            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/categorypage", {
                userLayout: true,
                allProduct,
                usernav: req.session.user,
                chekckButton,
                prevBtn,
                nexturl,
                prevUrl
            })
        })
    } else {
        res.redirect("/allproduct")
    }

})

/* this is fro special brand offer */

router.get("/brand-off", (req, res) => {
    if (req.query) {
        productDB.gettingBrandOffer(req.query).then((result) => {
            let allProduct = result
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/categorypage", {
                userLayout: true,
                allProduct,
                usernav: req.session.user,
            })
        })
    } else {
        res.redirect("/allproduct")
    }
})



/* by getting dependace on department */
router.get("/products/:topic", (req, res) => {
    if (req.query) {
        let wantskip = req.query.next || 0
        
         productDB.getByDepartment(req.params.topic, req.query, wantskip).then((result) => {    
            let skipping = parseInt(wantskip) + 6
            let chekckButton = true;

            let prevBtn = true;
            if (skipping < result.c) {
                skipping = parseInt(wantskip) + 6

            } else {
                skipping = result.c
                chekckButton = false
            }
             
            if (wantskip < 6) {
                prevBtn = false
            }
             
            let nexturl = `/products/${req.params.topic}?filter=${req.query.filter}&next=${skipping}`
            let prviouValue = parseInt(wantskip) - 6
            let prevUrl = `/products/${req.params.topic}?filter=${req.query.filter}&next=${prviouValue}`


            let allProduct = result.re

            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/categorypage", {
                userLayout: true,
                allProduct,
                usernav: req.session.user,
                nexturl,
                prevUrl,
                prevBtn,
                chekckButton


            })
        })
    } else {
        res.redirect("/allproduct")
    }
})

/* all watches */
router.get("/allproduct/watches", (req, res) => {
    productDB.getAllwatches().then((result) => {
        let allProduct = result
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.render("userpages/categorypage", {
            userLayout: true,
            allProduct,
            usernav: req.session.user,
        })
    })
})


/* getting new all top brands product */
router.get("/top-brands", (req, res) => {
    if (req.query) {
        let wantskip = req.query.next ||0
     

        productDB.getitemByBrand(req.query,wantskip).then((result) => {

            let skipping = parseInt(wantskip) + 6
            let chekckButton = true;
            let prevBtn = true;
            if (skipping < result.c) {
                skipping = parseInt(wantskip) + 6

            } else {
                skipping = result.c
                chekckButton = false
            }
             
            if (wantskip < 6) {
                prevBtn = false
            }
            console.log(req.query)
            let nexturl = ` /top-brands?brand=${req.query.brand}&next=${skipping}`
            let prviouValue = parseInt(wantskip) - 6
            let prevUrl = `/top-brands?brand=${req.query.brand}&next=${prviouValue}`


            let allProduct = result.re

            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/categorypage", {
                userLayout: true,
                allProduct,
                usernav: req.session.user,
                prevUrl,
                nexturl,
                chekckButton,
                prevBtn

            })
        })
    } else {
        res.redirect("/allproduct")
    }
})


/* getting product as price range  */
router.get("/allproduct/price", (req, res) => {
    if (req.query) {
        let wantskip = req.query.next ||0
        productDB.gePriceRange(req.query,wantskip).then((result) => {
            let skipping = parseInt(wantskip) + 6
            let chekckButton = true;
            let prevBtn = true;
            console.log(result.c)
            if (skipping < result.c) {
                skipping = parseInt(wantskip) + 6

            } else {
                skipping = result.c
                chekckButton = false
            }
             
            if (wantskip < 6) {
                prevBtn = false
            }
            console.log(req.query)
            let nexturl = `/allproduct/price?start=${req.query.start}&end=${req.query.end}&next=${skipping}`
            let prviouValue = parseInt(wantskip) - 6
            let prevUrl = `/allproduct/price?start=${req.query.start}&end=${req.query.end}&next=${prviouValue}`


            let allProduct = result.re
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.render("userpages/categorypage", {
                userLayout: true,
                allProduct,
                usernav: req.session.user,
                chekckButton,
                prevBtn,
                prevUrl,
                nexturl
                


            })
        })
    } else {
        res.redirect("/allproduct")
    }
})


/* adding the review to database */
router.post("/rating/product/:topic", (req, res) => {
    let username = req.session.user.name
    let user = req.session.user.uid
    let product = req.params.topic
    userDB.addReview(req.body, user, product, username).then((data) => {
        res.redirect("/myaccount")
    })
})



/* logout user */
router.get("/logout", (req, res) => {
    delete req.session.user;
    res.redirect("/")
})


module.exports = router;