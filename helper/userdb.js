const mongoose = require('mongoose');
const {
    ObjectId
} = require('mongodb');
const { nanoid } = require('nanoid');
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
var Razorpay = require("razorpay")
var instance = new Razorpay({
    key_id: process.env.RKEY,
    key_secret: process.env.RSECRET
})
 
 

const productDB = require("../helper/product")
const bcrypt = require('bcrypt');
const {
    resolve
} = require('path');

const saltRounds = 10;

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    password: String,
    status: Boolean,
    date: {
        type:String,
        default:new Date()
    },
    referalId:{
        type: String,
        default: () => nanoid(7)
      },
    referalStatus:Boolean,
    referalEarnings:{
        type:Number,
        default:0
    },
    referedId:String,
    referlusers:Array,
    cart: Array,
    wishlish: Array,
    address: Array,
    shippingCharg: Number,
    googleId:String,
    facebookId:String
})

const User = mongoose.model('User', UserSchema);


// cart schema 

const orderSchema = new mongoose.Schema({
    userId: ObjectId,
    products: Array,
    address: Object,
    payment: String,
    placedDated: Date,
    totalOfOrder: Number,
    shippingCharg: Number,
    paymentStatus: String


})

const Order = mongoose.model("order", orderSchema)

const CoupenSchema = new mongoose.Schema({
    couponName:String,
    usersUsed:Array,
    dicount:Number,
    maxamount:Number,
    minpurchase:Number,
    expire:Date,
    expireAt: { type: Date, default: Date.now }
})
CoupenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const Coupon = mongoose.model("coupon",CoupenSchema)

const ReviewSchema = new mongoose.Schema({
    pid:String,
    date:{
        type:Date,
        default:new Date()
    },
    name:String,
    uid:String,
    star:Number,
    review:String
})

const Review = mongoose.model("review",ReviewSchema)

module.exports = {
    // user sign up function
    userSignup: (userdata, todaydate) => {
        return new Promise(async (resolve, reject) => {
            // checking existiting username
            let emailExist = User.countDocuments({
                email: userdata.email
            })
            let phoenExist = User.countDocuments({
                phone: userdata.phone
            })
            Promise.all([emailExist, phoenExist]).then(async(out) => {

                if (out[0] != 0) {

                    reject("Email Already exist")
                } else if (out[1] != 0) {
                    reject("Phone Already exist")
                } else {
                    let flag =true;
                    if(userdata.referal.length > 0){
                        let referIdCheck = await User.countDocuments({
                            referalId: userdata.referal
                        })
                        if(referIdCheck ==0){
                            flag =false;
                            reject("Please Enter Valid Referal Code")   
                        }else{
                            bcrypt.hash(userdata.password, saltRounds, function (err, hash) {
                                if (!err) {
                                    const dataUp = new User({
                                        name: userdata.name,
                                        email: userdata.email,
                                        phone: userdata.phone,
                                        password: hash,
                                        status: true,
                                        date: todaydate,
                                        referalStatus:true,
                                        referedId:userdata.referal,
                                        referalEarnings:0,
                                        referlusers:[]
                                    })
                                    dataUp.save((err, room) => {
                                        if (err) {
                                            console.log(err)
                                        } else {
                                            resolve(room)
                                        }
                                    });
                                } else {
                                    console.log(err);
                                }
                            });
                        }   
                    }else{
                        bcrypt.hash(userdata.password, saltRounds, function (err, hash) {
                            if (!err) {
                                const dataUp = new User({
                                    name: userdata.name,
                                    email: userdata.email,
                                    phone: userdata.phone,
                                    password: hash,
                                    status: true,
                                    date: todaydate,
                                    referalStatus:false,
                                    referalEarnings:0,
                                    referlusers:[]
                                })
                                dataUp.save((err, room) => {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                         resolve(room)
                                    }
                                });
                            } else {
                                console.log(err);
                            }
                        });
                    }
                 }
            })
        })
    },
    userSignin: (userdata) => {
        return new Promise((resolve, reject) => {
            User.findOne({
                email: userdata.email
            }, function (err, dbdata) {
                if (err) {
                    console.log(err)
                } else {
                    if (dbdata) {
                        bcrypt.compare(userdata.password, dbdata.password, function (err, result) {
                            if (result) {
                                resolve(dbdata)
                            } else {
                                reject("Email or Password Mismatch !")
                            }
                        });
                    } else {
                        reject("Email or Password Mismatch !")
                    }
                }
            })
        })
    },
    checkPhone: (ph) => {
        return new Promise((resolve, reject) => {
            User.findOne({
                phone: ph.phone
            }, function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    if (result) {
                        if (result.status) {
                            resolve(result)
                        } else {
                            reject("Your Account Block by Admin")
                        }
                    } else {
                        reject("This number is not Registerd")
                    }
                }
            })
        })
    },
    getOneUser: (id) => {
        return new Promise((resolve, reject) => {
            User.findOne({
                _id: id
            }, function (err, result) {
                if (!err) {
                    if (result) {
                        resolve(result)
                    } else {
                        reject("No User Found")
                    }
                } else {
                    console.log(err)
                }
            }).lean()
        })
    },
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            User.find({}, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    if (result) {
                        resolve(result)
                    } else {
                        reject("No Data Found")
                    }
                }
            }).lean()
        })
    },
    changeStatus: (data) => {
        return new Promise((resolve, reject) => {
            User.findOne({
                _id: data.uid
            }, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    if (result.status) {
                        User.findOneAndUpdate({
                            _id: data.uid
                        }, {
                            $set: {
                                status: false
                            }
                        }, (err, ok) => {
                            if (!err) {
                                resolve(false)
                            } else {
                                console.log(err)
                            }
                        })
                    } else {
                        User.findOneAndUpdate({
                            _id: data.uid
                        }, {
                            $set: {
                                status: true
                            }
                        }, (err, ok) => {
                            if (!err) {
                                resolve(true)
                            } else {
                                console.log(err)
                            }
                        })
                    }

                }
            })
        })
    },
    // ...................cart managemet...............................
    addToCart: (id, productID) => {
        return new Promise(async (resolve, reject) => {

            let userCart = await User.findOne({
                $and: [{
                    _id: id
                }, {
                    cart: {
                        $elemMatch: {
                            pid: ObjectId(productID)
                        }
                    }
                }]
            })


            // orginal product quantity
            let orginalQty;
            await productDB.getOneProduct(productID).then((orginal) => {
                orginalQty = orginal.Quantity
            })



            if (userCart) {

                let flag = false
                // checking quantity
                userCart.cart.forEach((item) => {
                    if (item.pid == productID) {

                        if (item.qty < orginalQty) {

                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                })
                if (flag) {
                    let updateQuery = {
                        $inc: {
                            "cart.$.qty": 1
                        }
                    }
                    User.updateOne({
                        _id: id,
                        cart: {
                            $elemMatch: {
                                pid: ObjectId(productID)
                            }
                        }
                    }, updateQuery, (err, updated) => {
                        if (!err) {
                            User.findOne({
                                _id: id
                            }, (nrr, data) => {
                                if (nrr) {
                                    console.log(nrr)
                                } else {

                                    resolve({
                                        status: "already",
                                        userData: data
                                    })
                                }
                            })
                        } else {
                            console.log(err)
                        }
                    })
                } else {

                    reject("No Quanity Left")
                }
            } else {

                let cartItem = {
                    pid: ObjectId(productID),
                    qty: 1
                }
                User.updateOne({
                    _id: id
                }, {
                    $push: {
                        cart: cartItem
                    }
                }, function (err, result) {
                    if (err) {
                        console.log(err)
                        reject(err)
                    } else {
                        User.findOne({
                            _id: id
                        }, (nrr, data) => {
                            if (nrr) {
                                console.log(nrr)
                            } else {


                                resolve({
                                    status: "new",
                                    userData: data
                                })
                            }
                        })
                    }
                })
            }
        })
    },
    //............................this is for product fetching from cart.................... 
    getCartProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            let data = await User.aggregate([{
                    $match: {
                        _id: ObjectId(id)
                    }
                }, {
                    $unwind: "$cart"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "cart.pid",
                        foreignField: "_id",
                        as: "newOne"
                    }
                },
                {
                    $project: {
                        cart: 1,
                        newOne: 1
                    }
                },
                {
                    $unwind: "$newOne"
                },
                {
                    $project: {
                        userId: "$_id",
                        _id: 0,
                        pId: "$newOne._id",
                        qty: "$cart.qty",
                        pName: "$newOne.Name",
                        prize: "$newOne.Prize",
                        color: "$newOne.Color",
                        size: "$newOne.Size",
                        maxQuantity: "$newOne.Quantity",
                        discount: "$newOne.Discount",
                        OfferPrize: "$newOne.OfferPrize",
                        total: {
                            $multiply: ["$cart.qty", "$newOne.OfferPrize"]
                        }

                    }
                }
            ])
             data.forEach((item,index)=>{
                 console.log(item.maxQuantity)
                 if(item.qty>item.maxQuantity){
                     User.updateOne({_id:item.userId},{$pull:{cart:{pid:item.pId}}},()=>{})
                     data.shift(index)
                 }
                 
             })
            resolve(data)

        })
    },

    deleteCartItem: (uid, proId) => {
        return new Promise((resolve, reject) => {

            User.updateOne({
                _id: uid
            }, {
                $pull: {
                    cart: {
                        pid: ObjectId(proId)
                    }
                }
            }, (err, result) => {
                resolve(true)
            })
        })
    },
    changeQty: (user, prId, pqty) => {
        return new Promise((resolve, reject) => {
            let updateQuery = {
                $inc: {
                    "cart.$.qty": pqty
                }
            }
            User.updateOne({
                _id: user,
                cart: {
                    $elemMatch: {
                        pid: ObjectId(prId)
                    }
                }
            }, updateQuery, (err, updated) => {
                if (err) {
                    console.log(err)
                } else {
                    User.findOne({
                        _id: user
                    }, (nrr, data) => {
                        if (nrr) {
                            console.log(nrr)
                        } else {

                            resolve(data)
                        }
                    })
                }
            })
        })
    },

    addingOrder: (id, billAddress, payment, savingAdd,referal,pocketMoney,couponcode) => {
        return new Promise(async (resolve, reject) => {

            if (savingAdd) {
                User.findOneAndUpdate({
                    _id: id
                }, {
                    $push: {
                        address: billAddress
                    }
                }, function (err, upresult) {
                    if (err) {
                        console.log(err)
                    }
                })
            }

            let data = await User.aggregate([{
                    $match: {
                        _id: ObjectId(id)
                    }
                }, {
                    $unwind: "$cart"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "cart.pid",
                        foreignField: "_id",
                        as: "newOne"
                    }
                },
                {
                    $project: {
                        cart: 1,
                        newOne: 1
                    }
                },
                {
                    $unwind: "$newOne"
                },
                {
                    $project: {
                        userId: "$_id",
                        _id: 0,
                        pId: "$newOne._id",
                        qty: "$cart.qty",
                        pName: "$newOne.Name",
                        Ptype: "$newOne.Type",
                        prize: "$newOne.Prize",
                        color: "$newOne.Color",
                        size: "$newOne.Size",
                        maxQuantity: "$newOne.Quantity",
                        discount: "$newOne.Discount",
                        OfferPrize: "$newOne.OfferPrize",
                        total: {
                            $multiply: ["$cart.qty", "$newOne.OfferPrize"]
                        }

                    }
                }
            ])

            // delete cart items;
            
            if (payment == "cashonDelivery") {
                User.findOneAndUpdate({
                    _id: id
                }, {
                    $set: {
                        cart: [],
                        referalStatus:false
                    }
                }, (err, dl) => {
                    if (err) {

                        console.log(err)

                    } 
                })

              }

              let orderingUser = await User.findOne({_id:id})
              /* this is for getting user referal status and it will become false and the owner of this referal code get some points */
               if(referal !=0){
                    User.updateOne({_id:id},{$set:{referalStatus:false}},(err,dataMoy)=>{
                    console.log("this is user referal status chage",dataMoy)})

                
                    User.updateOne({referalId:orderingUser.referedId},{$inc:{referalEarnings:20},$push:{referlusers:id}},(err,referedOwnerGotPointed)=>{
                    console.log("adding referal points",referedOwnerGotPointed)})
               }
               
               let orginalPocket = orderingUser.referalEarnings
               let currentPocket = orginalPocket - pocketMoney
               currentPocket =  Math.round(Number(currentPocket))
               
               if(currentPocket < 0){
                   currentPocket =0;
                }

                User.updateOne({_id:id},{$set:{referalEarnings:currentPocket}},(err,pocketUpdated)=>{
                    console.log(pocketUpdated)
                })
                

            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            let delivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", options);

            let cartDat = []
            let orderTotal = 0;
            //  cartDuplicateforRemoveProduct
            let cartDuplicate = [];

            data.forEach((items) => {
                let pdata = {
                    pid: items.pId,
                    qty: items.qty,
                    productname: items.pName,
                    pType: items.Ptype,
                    prize: items.prize,
                    total: items.total,
                    status: 'PLACED',
                    orderDate: new Date(),
                    shipDate: "",
                    expDelivery: delivery,
                    DeliveredDate: ""

                }
                let realqty = (items.maxQuantity - items.qty);
                if (realqty >= 0) {
                    realqty = realqty
                } else {
                    realqty = 0;
                }
                let cartDup = {
                    product: items.pId,
                    newQty: realqty
                }
                cartDuplicate.push(cartDup)
                orderTotal = orderTotal + parseInt(items.total);
                cartDat.push(pdata)
            })

            cartDuplicate.forEach((pdata) => {
                productDB.productQtyChange(pdata).then((updatedQty) => {
                    console.log(updatedQty)
                })
            })

            /* here is the coupon code checking */
            let coupon = await Coupon.findOne({couponName:couponcode})
             let offerAmount=0;
             if(coupon){
            if(orderTotal > coupon.minpurchase){
            
                 offerAmount =Math.round( (orderTotal/100)*coupon.dicount)
                if(offerAmount <= coupon.maxamount){
                    offerAmount= offerAmount
                }else{
                    offerAmount= coupon.maxamount
                }
            }else{
                offerAmount=0;
            }
          }
           
            orderTotal = (orderTotal- referal)-offerAmount- pocketMoney
            let shipCharge;
            if (orderTotal < 3000) {
                shipCharge = 120;
                orderTotal = Number(orderTotal) + 120  
            } else {
                shipCharge = 0
            }


            /* here coupon updating */
            

            /* this is for upate his pocket balance */
        
            // reomve product quantity by order

            let order = new Order({
                userId: ObjectId(id),
                products: cartDat,
                address: billAddress,
                payment: payment,
                totalOfOrder: Number(orderTotal),
                placedDated: new Date(),
                shippingCharg: shipCharge,
                paymentStatus: 'Pending'
            })

            order.save((er, room) => {
                if (er) {
                    reject(er)
                } else {
                    Coupon.updateOne({couponName:couponcode},
                        {$push:{usersUsed:id}}
                        ,(err,couponUpdated)=>{console.log(couponUpdated)})
                    resolve(room)
                }
            })



        })
    },
    getAddress: (uid, addname) => {
        return new Promise(async (resolve, reject) => {

            let data;
            await User.findOne({
                _id: uid
            }, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    data = result
                }

            })
            let address;

            data.address.forEach((itm) => {
                if (itm.AddressName == addname) {
                    address = itm
                }
            })

            resolve(address)
        })
    },
    getAllOrders: () => {
        return new Promise((resolve, reject) => {
            Order.find({}, (err, re) => {
                if (!err) {
                    resolve(re)
                } else {
                    reject(err)
                }
            }).lean()
        })
    },
    changeOrderStatus: (oid, productID, st) => {
        return new Promise((resolve, reject) => {
            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };

            if (st == "DELIVERED") {

                Order.updateOne({
                    _id: ObjectId(oid),
                    products: {
                        $elemMatch: {
                            pid: ObjectId(productID)
                        }
                    }
                }, {
                    $set: {
                        'products.$.status': st,
                        'products.$.DeliveredDate': new Date()
                    }
                }, (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        Order.updateOne({
                            _id: ObjectId(oid)
                        }, {
                            $set: {
                                paymentStatus: "PAID"
                            }
                        }, (err, result) => {
                            if (err) {
                                console.log(err)
                            } else {
                                resolve(result)
                            }
                        })
                    }
                })
            } else if (st == "SHIPPED") {

                Order.updateOne({
                    _id: ObjectId(oid),
                    products: {
                        $elemMatch: {
                            pid: ObjectId(productID)
                        }
                    }
                }, {
                    $set: {
                        'products.$.status': st,
                        'products.$.shipDate': new Date()
                    }
                }, (err, result) => {
                    resolve(result)
                })
            } else {
                Order.updateOne({
                    _id: ObjectId(oid),
                    products: {
                        $elemMatch: {
                            pid: ObjectId(productID)
                        }
                    }
                }, {
                    $set: {
                        'products.$.status': st

                    }
                }, (err, result) => {
                    resolve(result)
                })
            }

        })
    },

    getUserOrder: (uid) => {
        return new Promise((resolve, reject) => {
            Order.find({
                userId: ObjectId(uid)
            }, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    resolve(result)
                }
            }).lean()
        })
    },
    addAddressToUser: (uid, address, ogName) => {
        return new Promise((resolve, reject) => {

            User.updateOne({
                _id: ObjectId(uid),
                address: {
                    $elemMatch: {
                        AddressName: ogName
                    }
                }
            }, {
                $set: {

                    'address.$.AddressName': address.AddressName,
                    'address.$.FirstName': address.FirstName,
                    'address.$.LastName': address.LastName,
                    'address.$.HouseNo': address.HouseNo,
                    'address.$.Address': address.Address,
                    'address.$.Town': address.Town,
                    'address.$.State': address.State,
                    'address.$.Pincode': address.Pincode,
                    'address.$.Phone': address.Phone,



                }
            }, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    resolve(result)
                }
            })
        })
    },
    deleteAddress: (uid, addname) => {
        return new Promise((resolve, reject) => {
            User.updateOne({
                _id: uid
            }, {
                $pull: {
                    address: {
                        AddressName: addname
                    }
                }
            }, (err, result) => {
                resolve(true)
            })
        })

    },
    updateUserDetail: (uid, updateData) => {
        return new Promise(async (resolve, reject) => {

            console.log(updateData)
            let data = await User.find({
                $or: [{
                    email: updateData.email
                }, {
                    phone: updateData.phone
                }]
            })
        
            let flag = false
            if (data.length == 1) {
              
                if (data[0]._id == uid) {
                   
                    flag = true;

                } else {
                    flag = false;
                    reject("Email or Phone Number Already existed")
                }
            } else {

                flag = false
                reject("Email or Phone Number Already Exist")
            }
            
            if (flag) {
                User.updateOne({
                    _id: ObjectId(uid)
                }, {
                    $set: updateData
                       
                   
                }, (err, result) => {

                    resolve(true)
                })
            }
        })
    },
    cancelOrder: (userId, orderId, productId) => {
        return new Promise(async (resolve, reject) => {

            let orderData = await Order.findOne({
                _id: ObjectId(orderId),
                products: {
                    $elemMatch: {
                        pid: ObjectId(productId)
                    }
                }
            })
            let latestPrize = (orderData.totalOfOrder - orderData.products[0].total)
            let shipCharge = 0;
            if (latestPrize == 0) {
                latestPrize = 0
            } else if (latestPrize < 3000) {
                shipCharge = 120
                latestPrize = latestPrize + shipCharge
            }
            let cartItem = {
                pid: ObjectId(orderData.products[0].pid),
                qty: orderData.products[0].qty
            }

            let userCart = await User.findOne({
                $and: [{
                    _id: ObjectId(userId)
                }, {
                    cart: {
                        $elemMatch: {
                            pid: ObjectId(orderData.products[0].pid)
                        }
                    }
                }]
            })

            if (userCart) {
                let updateQuery = {
                    $inc: {
                        "cart.$.qty": cartItem.qty
                    }
                }
                User.updateOne({
                    _id: ObjectId(userId),
                    cart: {
                        $elemMatch: {
                            pid: ObjectId(productId)
                        }
                    }
                }, updateQuery, (err, updated) => {
                    if (err) {
                        console.log(err)
                    }
                })
            } else {
                User.updateOne({
                    _id: ObjectId(userId)
                }, {
                    $push: {
                        cart: cartItem
                    }
                }, (err, added) => {
                    if (err) {
                        console.log(err)
                    } else {

                    }
                })
            }



            // update quantity in product inventory 
            productDB.updteQuantity(productId, cartItem.qty).then((updqty) => {

            })
            // change status of order 

            let st = 'CANCEL'
            Order.updateOne({
                _id: ObjectId(orderId),
                products: {
                    $elemMatch: {
                        pid: ObjectId(productId)
                    }
                }
            }, {
                $set: {
                    'products.$.status': st,
                    totalOfOrder: Number(latestPrize),
                    shippingCharg: shipCharge

                }
            }, (err, updateOrderst) => {
                resolve(true)
            })


        })
    },
    genrateRazerPay: (orderData) => {
        return new Promise((resolve, reject) => {
            let total = (orderData.totalOfOrder * 100)

            var options = {
                amount: orderData.totalOfOrder * 100, // amount in the smallest currency unit
                currency: "INR",
                receipt: orderData._id.toString()
            };
            instance.orders.create(options, function (err, order) {

                resolve(order)
            });
        })
    },
    verifyPayment: (datas) => {
        return new Promise((resolve, reject) => {
            const crypto = require("crypto")
            let hmac = crypto.createHmac('sha256', '8MRYVM8Tm1rQmAB14LNt22MN');

            hmac.update(datas['response[razorpay_order_id]'] + '|' + datas['response[razorpay_payment_id]'], '8MRYVM8Tm1rQmAB14LNt22MN')
            hmac = hmac.digest('hex')
            if (hmac === datas['response[razorpay_signature]']) {
                let orderId = datas['payments[receipt]']
                resolve(orderId)
            } else {
                reject(false)
            }

        })
    },
    changePaymentStatus: (order, status, user) => {
        return new Promise((resolve, reject) => {

            User.findOneAndUpdate({
                _id: ObjectId(user)
            }, {
                $set: {
                    cart: []
                }
            }, (err, dl) => {
                if (err) {
                    console.log(err)

                }
            })

            Order.updateOne({
                _id: ObjectId(order)
            }, {
                $set: {
                    paymentStatus: status
                }
            }, (err, result) => {
                if (err) {
                    console.log(err)
                } else {

                    resolve(result)

                }
            })
        })
    },
    cancelOrderOfPaymentFaild: (orderdata,user,coupon) => {
        return new Promise((resolve, reject) => {

            orderdata.products.forEach(async (items) => {
                let pId = items.pid
                let quantity = items.qty

                productDB.updteQuantity(pId, quantity).then((updqty) => {
                    console.log("product quantity incremented by cancel ", updqty)
                })
            })
           if(coupon){
            Coupon.updateOne({couponName:coupon},
                {$pull:{usersUsed:user}}
                ,(err,couponUpdated)=>{console.log(couponUpdated)})
           }
            Order.deleteOne({
                _id: ObjectId(orderdata._id)
            }, (err, rem) => {
                if (err) {
                    console.log(err)
                } else {
                    resolve(rem)
                }
            })
        })
    },
    getDataFilterd: (filter) => {
        return new Promise((resolve, reject) => {

            var fromDate = new Date(filter.fromdate);
            fromDate = new Date(fromDate.setHours(0, 0, 0, 0)).toISOString();

            // let start = fromDate.toISOString()

            var toDate = new Date(filter.todate);
            toDate = new Date(toDate.setHours(23, 59, 59, 0)).toISOString();
            console.log(toDate)

            console.log(fromDate)
            Order.find({
                placedDated: {
                    $gte: fromDate,
                    $lte: toDate
                }
            }, (err, datas) => {
                resolve(datas)
            }).lean()

        })
    },
    salesReport: () => {
        return new Promise((resolve, reject) => {

            Order.find({
                products: {
                    $elemMatch: {
                        status: 'DELIVERED'
                    }
                }
            }, (err, re) => {
                if (!err) {
                    resolve(re)
                } else {
                    reject(err)
                }
            }).lean()
        })
    },
    salesReportFilter: (filter) => {
        return new Promise((resolve, reject) => {

            var fromDate = new Date(filter.fromdate);
            fromDate = new Date(fromDate.setHours(0, 0, 0, 0)).toISOString();

            // let start = fromDate.toISOString()

            var toDate = new Date(filter.todate);
            toDate = new Date(toDate.setHours(23, 59, 59, 0)).toISOString();


            Order.find({
                products: {
                    $elemMatch: {
                        status: 'DELIVERED',
                        DeliveredDate: {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate)
                        }
                    }
                }
            }, (err, re) => {
                if (!err) {
                    console.log(re)
                    resolve(re)
                } else {
                    reject(err)
                }
            }).lean()
        })
    },
    salesReportDaily: () => {
        return new Promise((resolve, reject) => {


            var toDay = new Date();
            toDay = new Date(toDay.setHours(0, 0, 0, 0)).toISOString();


            Order.find({
                products: {
                    $elemMatch: {
                        status: 'DELIVERED',
                        DeliveredDate: {
                            $gte: new Date(toDay)
                        }
                    }
                }
            }, (err, re) => {
                if (!err) {
                    console.log(re)
                    resolve(re)
                } else {
                    reject(err)
                }
            }).lean()
        })
    },
    salesReportWeekly: () => {
        return new Promise((resolve, reject) => {
            var day = new Date().getDay();

            if (day == 0) {
                day = 7;
            } else if (day == 1) {
                day = 2
            }

            let nowDate = new Date(Date.now() - day * 24 * 60 * 60 * 1000)
            var date = new Date(nowDate.setHours(0, 0, 0, 0)).toISOString()
            Order.find({
                products: {
                    $elemMatch: {
                        status: 'DELIVERED',
                        DeliveredDate: {
                            $gte: new Date(date)
                        }
                    }
                }
            }, (err, re) => {
                if (!err) {
                    console.log(re)
                    resolve(re)
                } else {
                    reject(err)
                }
            }).lean()
        })
    },
    salesReportMonthly: () => {
        return new Promise((resolve, reject) => {
            var month = new Date();
            var firstMonth = new Date(month.getFullYear(), month.getMonth(), 1)
            var date = new Date(firstMonth.setHours(0, 0, 0, 0)).toISOString()

            Order.find({
                products: {
                    $elemMatch: {
                        status: 'DELIVERED',
                        DeliveredDate: {
                            $gte: new Date(date)
                        }
                    }
                }
            }, (err, re) => {
                if (!err) {
                    console.log(re)
                    resolve(re)
                } else {
                    reject(err)
                }
            }).lean()
        })
    },
    salesReportYearly: () => {
        return new Promise((resolve, reject) => {
            var currentYear = new Date().getFullYear()
            currentYear = currentYear + "-" + "01-01"
            currentYear = new Date(currentYear)
            var date = new Date(currentYear).toISOString()
           
            Order.find({
                products: {
                    $elemMatch: {
                        status: 'DELIVERED',
                        DeliveredDate: {
                            $gte: new Date(date)
                        }
                    }
                }
            }, (err, re) => {
                if (!err) {
                    console.log(re)
                    resolve(re)
                } else {
                    reject(err)
                }
            }).lean()
        })
    },
    getDashboardDetails: () => {
        return new Promise(async (resolve, reject) => {
            // get payment method documnets
            var toDay = new Date();
            toDay = new Date(toDay.setHours(0, 0, 0, 0)).toISOString();

            let users = await User.countDocuments({})
            let order = await Order.countDocuments({})
            let totalPaymetns = await Order.aggregate([{
                $group: {
                    _id: null,
                    total: {
                        $sum: "$totalOfOrder"
                    }
                }
            }])
            let todaySales = await Order.countDocuments({
                products: {
                    $elemMatch: {
                        orderDate: {
                            $gte: new Date(toDay)
                        }
                    }
                }
            })
            let payments = await Order.aggregate([{
                $group: {
                    _id: "$payment",
                    count: {
                        $sum: 1
                    }
                }
            }])
            let orderPayments = await Order.aggregate([
                { $match:{paymentStatus:"PAID"} }, {
                $group: {
                    _id: {
                        $substr: ["$placedDated", 5, 2]
                    },
                    amount: {
                        $sum: "$totalOfOrder"
                    }
                }
            }])
            let datas = {
                pay: payments,
                monthly: orderPayments,
                users,
                order,
                totalPaymetns,
                todaySales
            }
            console.log((todaySales));
            resolve(datas)
        })
    },
    emailChek: (inputEmail) => {
        return new Promise((resolve, reject) => {
            User.findOne({
                email: inputEmail
            }, (err, res) => {
                if (err) {
                    console.log(err)
                } else {
                    if (res) {
                        resolve(true)
                    } else {
                        reject(false)
                    }
                }
            })
        })
    },
    resetPassword: (inputEmail, pass) => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(pass, saltRounds, function (err, hash) {
                if (err) {
                    console.log(err)
                } else {
                    User.updateOne({
                        email: inputEmail
                    }, {
                        $set: {
                            password: hash
                        }
                    }).then(() => {
                        resolve(true)

                    }).catch((err) => {
                        reject(err)
                    })
                }
            });

        })
    },
    changePassword: (user, old, newpass) => {
        return new Promise((resolve, reject) => {
            User.findOne({
                _id: ObjectId(user)
            }, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    bcrypt.compare(old, data.password, function (erro, result) {
                        if (erro) {
                            console.log(erro)
                        } else {
                            if (result) {
                                bcrypt.hash(newpass, saltRounds, function (err, hash) {
                                    User.updateOne({
                                        _id: user
                                    }, {
                                        $set: {
                                            password: hash
                                        }
                                    }, (errOfUser, dataOfUser) => {
                                        if (errOfUser) {
                                            console.log(errOfUser)
                                        } else {
                                            resolve(true)
                                        }
                                    })
                                });
                            } else {
                                reject("Your Old password not match")
                            }
                        }
                    });
                }
            })
        })
    },
    googelLogin:(profile)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(profile)
          let userExist=  await User.findOne({googleId:profile.id})
          if(userExist){
             console.log("user exits")
             resolve(userExist)
          }else{
            console.log("user not  exits")
            var todayDate = new Date().toLocaleDateString();
             const dataUp = new User({
                googleId:profile.id,
                name: profile._json.name,
                status: true,
                date:todayDate
             })
             dataUp.save((err,room)=>{
                resolve(room)
                 
             })
          }
             
        })
    },
    getOneuserbyGoogleId:(user)=>{
        return new Promise((resolve,reject)=>{
            User.findOne({googleId:user.id}).then((result)=>{
                console.log(result)
                resolve(result)
            })
        })
    },
    getOneuserbyFacebook:(profile)=>{
        return new Promise(async(resolve, reject)=>{
            console.log(profile)
            let userExist=  await User.findOne({facebookId:profile.user.id})
            if(userExist){
                console.log("user exits")
               resolve(userExist)
            }else{
              console.log("user not  exits")
               const dataUp = new User({
                  googleId:profile.user.id,
                  name: profile.user.displayName,
                  status: true,
               })
               dataUp.save((err,room)=>{
                  resolve(room)
               })
            }
        })
    },
    createCoupon:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let checkCoupon = await Coupon.countDocuments({couponName:data.coupon_name})
            if(checkCoupon !=0){
                reject("This Coupen Name Already Exist")
            }else{
               
                var expireDate = new Date(data.couponExp);
               
                const newCoupon = new Coupon({
                couponName:data.coupon_name,
                usersUsed:[],
                dicount:Number(data.discount),
                maxamount:Number(data.maxAmount),
                minpurchase:Number(data.min_purchaseAmount),
                expire:new Date(data.couponExp),
                expireAt:expireDate,
               })
               newCoupon.save((err,room)=>{
                   if(err){
                       console.log(err)
                   }else{
                       resolve(true)
                       console.log(room)
                   }
               })
            }

        })
    },
    getAllCoupon:()=>{
        return new Promise((resolve,reject)=>{
            Coupon.find({},(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                    resolve(result)
                }
            }).lean()
        })
    },
    checkCoupon:(data,user)=>{
      
        return new Promise(async(resolve,reject)=>{
            let coupon = await Coupon.findOne({couponName:data.code})
            
            if(coupon){
                console.log("somthing")
                 let userExist= coupon.usersUsed.findIndex(item => item == user)
                 console.log(userExist)
                  if(userExist == -1){
                     resolve(coupon)
                  }else{
                    reject("you are used this once!")
                  }
            }else{
                reject("Invalid Coupon!")
            }
        })
    },
    deleteCoupon:(id)=>{
        return new Promise((resolve,reject)=>{
            Coupon.deleteOne({_id:ObjectId(id.cid)},(err,re)=>{
                if(err){
                    console.log(err)
                }else{
                    resolve(re)
                }
            })
        })
    },
    referalSecure:(id)=>{
        return new Promise((resolve,reject)=>{
            User.updateOne({_id:ObjectId(id)},{$set:{referalStatus:true}},(err,data)=>{
                resolve(data)
            })
        })
    },
    addReview:(data,user,product,username)=>{
        return new Promise(async(resolve,reject)=>{
            let checkAlready = await Review.countDocuments({$and:[{pid:ObjectId(product)},{uid:ObjectId(user)}]})
            if(checkAlready != 0){
                Review.updateOne({$and:[{pid:ObjectId(product)},{uid:ObjectId(user)}]},
                {$set:data},(err,r)=>{
                    console.log(r) 
                      resolve(r)
                }
                )
            }else{
                const reviewAdding = new Review({
                    pid:ObjectId(product),
                    uid:ObjectId(user),
                    star:Number(data.star),
                    review:data.review,
                    name:username
                })
                reviewAdding.save((err,room)=>{
                    if(err){
                        console.log(err)
                    }else{
                        console.log(room)
                        resolve(room)
                    }
                })
            }
            
        })
    },
    getReview:(p,u)=>{
        return new Promise((resolve,reject)=>{
            Review.findOne({$and:[{pid:ObjectId(p)},{uid:ObjectId(u)}]},(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                    if(result){
                        console.log(result)
                        resolve(result)
                    }else{
                        resolve({})
                    }
                }
            }).lean()
        })
    },
    getRealtedReview:(product)=>{
        return new Promise((resolve, reject)=>{
            Review.find({pid:product},(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                     
                    resolve(result)
                }
            }).lean()
        })
    }
    
}

//{products:{$elemMatch:{DeliveredDate:{$gte:fromDate,$lte:toDate}}}}