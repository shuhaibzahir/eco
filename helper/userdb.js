const mongoose = require('mongoose');
const {
    ObjectId
} = require('mongodb');

const productDB= require("../helper/product")
const bcrypt = require('bcrypt');
const saltRounds = 10;

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    password: String,
    status: Boolean,
    date: String,
    cart: Array,
    wishlish: Array,
    address:Array,
    shippingCharg:Number
})
const User = mongoose.model('User', UserSchema);


// cart schema 

const orderSchema = new mongoose.Schema({
    userId : ObjectId,
    products : Array,
    address:Object,
    payment:String,
    placedDated:String,
    totalOfOrder:Number,
    shippingCharg:Number
 
})

const Order = mongoose.model("order", orderSchema)






module.exports = {
    // user sign up function
    userSignup: (userdata, todaydate) => {
        return new Promise(async (resolve, reject) => {
            // checking existiting username
            let emailExist = User.countDocuments({
                email: userdata.email
            }).exec()
            let phoenExist = User.countDocuments({
                phone: userdata.phone
            }).exec()
            Promise.all([emailExist, phoenExist]).then((out) => {

                if (out[0] != 0) {

                    reject("Email Already exist")
                } else if (out[1] != 0) {
                    reject("Phone Already exist")
                } else {
                    bcrypt.hash(userdata.password, saltRounds, function (err, hash) {
                        if (!err) {
                            const dataUp = new User({
                                name: userdata.name,
                                email: userdata.email,
                                phone: userdata.phone,
                                password: hash,
                                status: true,
                                date: todaydate
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
            })
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
            console.log(userCart)
            if (userCart) {
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
                let cartItem = {
                    pid: ObjectId(productID),
                    qty: 1
                }
                User.findOneAndUpdate({
                    _id: id
                }, {
                    $push: {
                        cart: cartItem
                    }
                }, function (err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        User.findOne({
                            _id: id
                        }, (nrr, data) => {
                            if (nrr) {
                                console.log(nrr)
                            } else {
                                
                                console.log(data)
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
                        total:{$multiply:["$cart.qty","$newOne.OfferPrize"]}

                    }
                }
            ])
            resolve(data)

        })
    },

    deleteCartItem:(uid,proId)=>{
        return new Promise((resolve,reject)=>{
         
            User.updateOne({_id:uid},{
                $pull:{cart:{pid:ObjectId(proId)}}
            },(err,result)=>{
                resolve(true)
            })
        })
    },
    changeQty:(user,prId,pqty)=>{
        return new Promise((resolve, reject)=>{
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
                if(err){
                    console.log(err)
                }else{
                    User.findOne({
                        _id:user
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

    addingOrder:(id,billAddress,payment,savingAdd)=>{
        return new Promise(async(resolve,reject)=>{

            if(savingAdd){
                User.findOneAndUpdate({_id:id},{$push:{
                     address:billAddress
                }},function(err,upresult){
                    if(err){
                        console.log(err)
                    }else{
                        console.log(upresult)
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
                    total:{$multiply:["$cart.qty","$newOne.OfferPrize"]}

                }
            }
            ])

            // delete cart items;
            User.findOneAndUpdate({_id:id},{$unset:{cart:""}},(err,dl)=>{
                if(err){
                    console.log(err)

                }else{
                    console.log(dl)
                }
            })




            var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            let delivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", options);       
            var today = new Date().toLocaleString("en-US", options)
            let cartDat=[]
            let orderTotal=0;

            data.forEach((items)=>{
                let pdata ={
                    pid:items.pId,
                    qty:items.qty,
                    productname:items.pName,
                    pType:items.Ptype,
                    prize:items.prize,
                    total:items.total,
                    status:'Orderd',
                    orderDate:today,
                    shipDate:"",
                    expDelivery:delivery,
                    DeliveredDate:""

                }
                orderTotal=orderTotal+parseInt(items.total);
                cartDat.push(pdata)
            })
           
            let shipCharge;
            if(orderTotal < 3000){
                shipCharge=120;
            }else{
                shipCharge =0
            }
            
           
            let order = new Order({
                userId :ObjectId(id),
                products:cartDat,
                address:billAddress,
                payment:payment,
                totalOfOrder:Number(orderTotal),
                placedDated:today,
                shippingCharg:shipCharge
            })
           
            order.save((err,room)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(room)
                }
            })

             
            
        })
    },
    getAddress:(uid,addname)=>{
        
        return new Promise(async(resolve, reject )=>{
            console.log(uid,addname)
             let data ;
             await  User.findOne({_id:uid},(err,result)=>{
                if(err){
                    reject(err)
                }else{
                  data= result
                }
            
            })
            let address ;
            console.log(data)
            data.address.forEach((itm)=>{
                if(itm.AddressName==addname){
                    address= itm
                }
            })
           
            resolve(address)
        })
    },
    getAllOrders:()=>{
        return new Promise((resolve, reject)=>{
            Order.find({},(err,re)=>{
                if(!err){
                    resolve(re)
                }else{
                    reject(err)
                }
            }).lean()
        })
    }
}