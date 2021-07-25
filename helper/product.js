const {
    ObjectId
} = require("mongodb");

const mongoose = require("mongoose");
var Float = require('mongoose-float').loadType(mongoose, 2);
const ProductSchema = new mongoose.Schema({
    Name: String,
    Type: String,
    Brand: String,
    Prize: {
        type: Float
    },
    OfferPrize: {
        type: Float
    },
    Department: String,
    Category: String,
    Color: String,
    Size: String,
    Quantity: Number,
    Discount: {
        type: Float
    },
    Tags: Array,
    Mood: String,
    Description: String,
    created: {
        type: Date,
        default: Date.now
    },
    Olddiscount: String,
    ExpOffer: String,
    categoryExpdate: Date,

})
 
const Product = mongoose.model('Products', ProductSchema);
// CategoryM is cateogrymanagement

const categorySchema = new mongoose.Schema({
    section: String,
    brand: Array,
    ptype: Array,
    category: Array,


})

const Category = mongoose.model('Categoryms', categorySchema);

const BannerSchema = mongoose.Schema({
    sectionName: String,
    disStart: {
        type: Float
    },
    disEnd: {
        type: Float
    },
    department: String,
    offerTitle: String,
    created: {
        type: Date,
        default: Date.now
    },

})

const Banner = mongoose.model('banner', BannerSchema);

const SpecialOfferSchema = new mongoose.Schema({
    Brand: String,
    disStart: {
        type: Float
    },
    disEnd: {
        type: Float
    },
    Type: String,
    Title: String,
    created: {
        type: Date,
        default: Date.now
    },

})

const spBanner = mongoose.model("spBanner", SpecialOfferSchema)










module.exports = {
    // ......................... main section category adding................
    sectionManage: (sec) => {
        return new Promise(async (resolve, reject) => {

            let count = await Category.countDocuments({
                section: sec
            }).exec()
            if (count != 0) {
                reject("The Section Already Exist")
            } else {
                const newSection = new Category({
                    section: sec
                })
                newSection.save((err, room) => {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(room)
                    }
                })
            }
        })
    },
    // ......................... main section category ending................
    // ......................... main category  fetching................
    categoryFetching: () => {
        return new Promise((resolve, reject) => {
            Category.find({}, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            }).lean()
        })
    },
    // ......................... main category  fetching ending................
    // .............category only aggregatin...........
    categorOnly: () => {
        return new Promise((resolve, reject) => {
            let catFilterd = []
            let brandFilterd = [];
            let typeFilterd = []
            let catCategory = Category.distinct("category")
            let catBrand = Category.distinct("brand")
            let catPtype = Category.distinct("ptype")
            Promise.all([catCategory, catBrand, catPtype]).then((allcatData) => {
                catFilterd.push(...allcatData[0])
                brandFilterd.push(...allcatData[1])

                typeFilterd.push(...allcatData[2])
                resolve([catFilterd, brandFilterd, typeFilterd])
            }).catch((err) => {
                reject(err)
            })
        })
    },

    // .................testing..........................................


    // ......................... sub category  adding...............
    subCategoryAdd: (details, data) => {
        return new Promise(async (resolve, reject) => {
            let VARIABLE = details.option.trim()
            let count = await Category.countDocuments({
                section: details.section,
                [VARIABLE]: {
                    $in: [data]
                }
            }).exec()
            if (count != 0) {
                reject("Already Have Same Category")
            } else {

                Category.findOneAndUpdate({
                        section: details.section
                    }, {
                        $push: {
                            [VARIABLE]: data
                        }
                    },
                    (err, result) => {
                        resolve(data)
                    }
                )
            }

        })
    },
    // ......................dub category delete...............

    deleteSub: (sec, opt, item) => {
        return new Promise((resolve, reject) => {

            Category.updateOne({
                    section: sec
                }, {
                    $pull: {
                        [opt]: item
                    }
                },
                (err, result) => {
                    if (err) {
                        reject(err)
                    } else {
                        console.log(result)
                        resolve(true)
                    }
                }
            )
        })
    },

    // ......................... sub category  ending...............

    //  .................add product.................

    addProduct: (datas, tags) => {
        return new Promise((resolve, reject) => {
            let offer = (datas.prize / 100) * datas.discount;
            let reducedPrize = Math.floor(datas.prize - offer)
            const productData = new Product({
                Name: datas.name,
                Type: datas.product_type,
                Brand: datas.brand,
                Prize: datas.prize,
                Department: datas.department,
                Category: datas.category,
                Color: datas.color,
                Size: datas.size,
                Quantity: datas.quantity,
                Discount: datas.discount,
                Tags: tags,
                Mood: datas.mood,
                OfferPrize: reducedPrize,
                Description: datas.decsription,
            })
            productData.save((err, room) => {
                if (err) {
                    console.log(err)
                } else {
                    resolve(room)
                }
            })
        })
    },
    // ..............get All Product...........
    getAllProduct: (wantskip) => {
        return new Promise(async(resolve, reject) => {
            let skipp = wantskip || 0
            let count= await Product.countDocuments({})
         
            let data = await Product.find({},(err, data) => {
                if (err) {
                    reject(err)
                } 
            }).limit(6)
            .skip(Number(skipp)).lean() 
            
            resolve({re:data,c:count})
        })
    },
    getAllProductforAdmin: () => {
        return new Promise((resolve, reject) => {
            console.log("its working here")
          Product.find({},(err, data) => {
                if (err) {
                   reject(err)
                } else{
                    resolve(data)
                }
            }).lean()
        })
    },
    // ..............get all product end...........
    // .................GET ONE PRODUCT.............

    getOneProduct: (pid) => {
        return new Promise((resolve, reject) => {
            Product.findOne({
                _id: pid
            }, function (err, result) {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            }).lean()
        })
    },
    // ...............GET ONE PRODUCT END........
    // get matching product foe product view page
    getMatchingProduct:(type , depart)=>
    {
    return new Promise(async(resolve,reject)=>{
      Product.find({Type:type,Department:depart},(err,data)=>{
          if(err){
              console.log(err)
          }else{
              resolve(data)
          }
      }).lean()
    })
  },
    // ...............Edit product ........
    editProduct: (allData, tags, pId) => {
        return new Promise((resolve, reject) => {
            let offer = (allData.prize / 100) * allData.discount;
            let reducedPrize = Math.floor(allData.prize - offer)
            console.log(reducedPrize)
            Product.findOneAndUpdate({
                _id: pId
            }, {
                $set: {
                    Name: allData.name,
                    Type: allData.product_type,
                    Brand: allData.brand,
                    Prize: allData.prize,
                    Department: allData.department,
                    Category: allData.category,
                    Color: allData.color,
                    Size: allData.size,
                    Quantity: allData.quantity,
                    Discount: allData.discount,
                    OfferPrize: reducedPrize,
                    Tags: tags,
                    Mood: allData.mood,
                    Description: allData.decsription,
                }
            }, (err, resultOfUpdate) => {
                if (err) {
                    reject(err)
                } else {
                    
                    resolve(resultOfUpdate)
                }
            })
        })
    },
    updteQuantity: (productid, qty) => {
        return new Promise((resolve, reject) => {
            Product.updateOne({
                _id: ObjectId(productid)
            }, {
                $inc: {
                    Quantity: qty
                }
            }, (err, updateQty) => {
                if (err) {
                    console.log(err)
                } else {
                    resolve(updateQty)
                }
            })
        })
    },
    // ...............Edit product end........

    // ...............Delete Product............  
    delteProduct: (id) => {
        return new Promise((resolve, reject) => {
            Product.findOneAndDelete({
                _id: id
            }, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    },
    // ...............Delete Product end............  
    addBanner: (bannerDetails) => {
        return new Promise((resolve, reject) => {
            const banner = new Banner({
                sectionName: bannerDetails.section,
                disStart: bannerDetails.discountStart,
                disEnd: bannerDetails.dicountEnd,
                offerTitle: bannerDetails.offerTitle,
                department: bannerDetails.department
            })
            banner.save((err, room) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(room)
                }
            })

        })
    },
    getAllBanner: () => {
        return new Promise((resolve, reject) => {
            Banner.find({}, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            }).lean()
        })
    },
    getBannersToHome: () => {
        return new Promise(async (resolve, reject) => {
            let details = await Banner.find({}).sort({
                created: -1
            }).limit(5).lean()
            let spbanner = await spBanner.find({}).sort({
                created: -1
            }).limit(1).lean()
            let data = {}
            if (details.length != 0 && spbanner.length != 0) {
                resolve({
                    main: details,
                    sp: spbanner
                })
            } else {
                reject(details)
            }
        })
    },
    delteBanner: (banId) => {
        return new Promise((resolve, reject) => {
            Banner.deleteOne({
                _id: banId
            }, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    },
    // ..............sepcial banner .................
    addSpecialBrand: (data) => {
        return new Promise((resolve, reject) => {
            const newSpBanner = new spBanner({
                Brand: data.brand,
                disStart: data.discountStart,
                disEnd: data.dicountEnd,
                Type: data.type,
                Title: data.offerTitle
            })

            newSpBanner.save((err, room) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(room)
                }
            })

        })
    },
    getAllSpecialBanner: () => {
        return new Promise((resolve, reject) => {
            spBanner.find({}, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            }).lean()

        })
    },
    // specilaBannerToHome:()=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let details =  await spBanner.find({}).sort({
    //             created: -1
    //         }).limit(1).lean()
    //          if(details.length!=0){
    //              resolve(details)
    //          }else{
    //              reject(details)
    //          }

    //     })
    // },
    deleteSpBanner: (id) => {
        return new Promise((resolve, reject) => {
            spBanner.deleteOne({
                _id: id
            }, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    console.log(result)
                    resolve(result)
                }
            })
        })
    },
    productQtyChange: (data) => {
        return new Promise((resolve, reject) => {
            Product.findOneAndUpdate({
                _id: data.product
            }, {
                $set: {
                    Quantity: data.newQty
                }
            }, (err, rs) => {
                if (err) {
                    console.log(err)
                } else {

                    resolve(rs)
                }
            })
        })
    },
    addProductOffer: (data) => {
        return new Promise(async (resolve, reject) => {
            let productId = data.pid;
            let offerPercentage = parseInt(data.offer)
            offerPercentage = Math.round(offerPercentage)
            let product = await Product.findOne({
                _id: ObjectId(productId)
            })
            let orginalPrize = product.Prize
            let oldDiscount = product.Discount
            
            let expOffer = new Date(data.expOffer).setHours(0,0,0,0)
            expOffer = new Date(expOffer).toISOString()

            let latestPrize = Math.floor((orginalPrize / 100) * offerPercentage)
            let offerprizeUpdate = orginalPrize - latestPrize

            Product.updateOne({
                _id: ObjectId(productId)
            }, {
                $set: {
                    Discount: offerPercentage,
                    OfferPrize: offerprizeUpdate,
                    Olddiscount: oldDiscount,
                    ExpOffer: expOffer,
                    categoryExpdate: null
                }
            }, function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    resolve({
                        prize: offerprizeUpdate,
                        discount: offerPercentage
                    })
                }
            })


        })
    },
    delteProductOffer: (data) => {
        return new Promise(async (resolve, reject) => {
            console.log(data)
            let productData = await Product.findOne({
                _id: ObjectId(data.productId)
            })
            let oldDiscount = productData.Olddiscount
            let orginalPrize = productData.Prize
            let discountAmount = (orginalPrize / 100) * oldDiscount
            let modifiedofferPrize = orginalPrize - discountAmount
            console.log(modifiedofferPrize)
            Product.updateOne({
                _id: ObjectId(data.productId)
            }, {
                $set: {
                    OfferPrize: modifiedofferPrize,
                    ExpOffer: null,
                    Discount: oldDiscount
                }
            }, (err, modified) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(modified)
                    resolve(true)
                }
            })
        })
    },
    getAllCategory: () => {
        return new Promise((resolve, reject) => {
            Product.aggregate([{
                $group: {
                    _id: "$Type"
                }
            }], (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    resolve(result)
                }
            })
        })
    },
    addCategoryOffer: (data) => {
        return new Promise(async (resolve, reject) => {
            let productPreviousData = await Product.find({
                Type: data.category
            })

            let expOffer = new Date(data.categoryExp).setHours(0,0,0,0)
            expOffer = new Date(expOffer).toISOString()

            productPreviousData.forEach(item => {
                if (item.Discount > Number(data.discount)) {
                    resolve(true)
                } else {
                    let mrpPrize = item.Prize;
                    let discountAmount = Math.round((mrpPrize / 100) * Number(data.discount))
                    let offerAmount = mrpPrize - discountAmount
                    Product.updateOne({
                        _id: item._id
                    }, {
                        $set: {
                            categoryExpdate: expOffer,
                            Discount: data.discount,
                            OfferPrize: offerAmount,
                            ExpOffer: null
                        }
                    }, (err, result) => {
                        if (err) {
                            console.log(err)
                        } else {
                            resolve(result)
                        }
                    })

                }
            });
        })
    },
    getCategoryExpireItems: () => {
        return new Promise(async (resolve, reject) => {

            let data = await Product.aggregate([{
                    $match: {
                        categoryExpdate: {
                            $ne: null
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            producttype: "$Type",
                            expDate: "$categoryExpdate",
                            discount: "$Discount"
                        }
                    }
                }
            ])
            let dateOftheDay = new Date()
            let expProducts = []
            data.forEach((item) => {
                if (item._id.expDate != null) {
                    expProducts.push(item)
                }

            })
            resolve(expProducts)
        })
    },
    deleteCategoryProdcut(id) {
        return new Promise(async (resolve, reject) => {
            let products = await Product.find({
                Type: id.type
            })
            products.forEach((item) => {
                if (item.categoryExpdate != null) {
                    let oldoffer = item.Olddiscount
                    let Mrp = item.Prize
                    let offerAmount = Math.round((Mrp / 100) * oldoffer)
                    let off = Mrp - offerAmount
                    Product.updateOne({
                        _id: item._id
                    }, {
                        $set: {
                            OfferPrize: off,
                            Discount: oldoffer,
                            categoryExpdate: null

                        }
                    }, (err, dataModified) => {
                        if (err) {
                            console.log(err)
                        } else {
                            resolve(true)
                        }
                    })

                } else {
                    resolve(true)
                }
            })
        })
    },
    productSearch:(data,wantskip)=>{
        return new Promise(async(resolve,reject)=>{
            let name = data.keyword.trim()
            let key = data.keyword
            key = key.trim()
            let skipp = wantskip || 0
            let count = await Product.countDocuments({$or:[{Tags:{$regex:`^${key}`,$options:"si"}},{Name:{$regex:`^${name}`,$options:"si"}}]})

            let datas = await Product.find({$or:[{Tags:{$regex:`^${key}`,$options:"si"}},{Name:{$regex:`^${name}`,$options:"si"}}]},(err)=>{
             if(err){
                 console.log(err)
             }
            }).limit(6)
            .skip(Number(skipp)).lean() 

            resolve({re:datas,c:count})
           
            // Product.aggregate([
            //     {$match:{$or:[{Tags:{$in:key}},{Name:data.keyword}]}}
            // ],(err,result)=>{
            //     resolve(result)
            // })
        })
    },
    getCategoryProduct:(data,wantskip)=>{
        return new Promise(async(resolve,reject)=>{
            let skipp = wantskip || 0
            let mood = data.mood 
            let dep = data.dep 
           
            let count = await Product.countDocuments({$and:[{Mood:{$regex:mood, $options:"si"}},{Department:{$regex:`^${dep}`,$options:"si"}}]})

            await  Product.find({$and:[{Mood:{$regex:mood, $options:"si"}},{Department:{$regex:`^${dep}`,$options:"si"}}]},(err,result)=>{
               resolve({re:result,c:count}) 
            }).limit(6).skip(Number(skipp)).lean() 
        })
    },
    getFootOrWatch:(sect,data,wantskip)=>{
        return new Promise(async(resolve,reject)=>{
            let skipp = wantskip || 0
            let dep = data.dep 
            let categoryDetails = await Category.find({section:{$regex:`^${sect}`,$options:"si"}})
            let ptypes = categoryDetails[0].ptype
            let count = Product.countDocuments({$and:[{Type:{$in:ptypes}},{Department:{$regex:`^${dep}`,$options:"si"}}]})
            let datas = await Product.find({$and:[{Type:{$in:ptypes}},{Department:{$regex:`^${dep}`,$options:"si"}}]},(err,result)=>{
                if(err){
                    console.log(err)
                } 
            }).limit(6)
            .skip(Number(skipp)).lean() 
            resolve({re:datas,c:count})

        })
    },
    getSpecialBannerProduct:(data,wantskip)=>{
        return new Promise(async(resolve, reject)=>{
            
            let sec = data.section
            let dep = data.dep
            let disStart = data.discount
            let disEnd = data.disend
            let categoryDetails = await Category.find({section:{$regex:`^${sec}`,$options:"si"}})
            let ptypes = categoryDetails[0].ptype

            let skipp = wantskip || 0
            let count = await Product.countDocuments({$and:[{Type:{$in:ptypes}},{Department:{$regex:`^${dep}`,$options:"si"}},
            {Discount:{$gt:disStart}}]})


            let dataOf = await  Product.find({$and:[{Type:{$in:ptypes}},{Department:{$regex:`^${dep}`,$options:"si"}},
            {Discount:{$gt:disStart}}]},(err,result)=>{
                if(err){
                    console.log(err)
                } 
            }).limit(6)
            .skip(Number(skipp)).lean() 
            resolve({re:dataOf,c:count})
         })
    },
    gettingBrandOffer:(data)=>{
        return new Promise((resolve,reject)=>{
         
                Product.find({$and:[{Type:{$regex:`^${data.type}`,$options:"si"}},{Brand:{$regex:`^${data.brand}`,$options:"si"}},
                {Discount:{$gt:data.des}}]},(err,result)=>{
                    if(err){
                        console.log(err)
                    }else{
                        
                        resolve(result)
                    }
                }).lean()
            
        })
    },
    getByDepartment:(sec,data,wantskip)=>{
        return new Promise(async(resolve,reject)=>{
            let skipp = wantskip || 0
            let keyword = sec.charAt(0).toUpperCase() + sec.slice(1)
            let count= await Product.countDocuments({[keyword]:{$regex:`^${data.filter}`,$options:"si"}})
             console.log(count)
           let datas =  await  Product.find({[keyword]:{$regex:`^${data.filter}`,$options:"si"}},(err)=>{
                if(err){
                    console.log(err)
                } 
            }).skip(Number(skipp)).limit(6)
            .lean() 

            resolve({re:datas,c:count})
        })
    },
    getAllwatches:()=>{
        return new Promise(async(resolve,reject)=>{
            let categoryDetails = await Category.find({section:"WATCHES"})
            let ptypes = categoryDetails[0].ptype
            Product.find({Type:{$in:ptypes}},(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                    
                    resolve(result)
                }
            }).lean()
        })
    },
    getitemByBrand:(data,wantskip)=>{
        return new Promise(async(resolve,reject)=>{
            let skipp = wantskip || 0
            let count =await  Product.countDocuments({Brand:{$regex:`^${data.brand}`,$options:"si"}})
            let datas =  await Product.find({Brand:{$regex:`^${data.brand}`,$options:"si"}},(err,result)=>{
               if(err){
                   console.log(err)
               }
           }).limit(6)
           .skip(Number(skipp)).lean() 

           resolve({re:datas,c:count})
        })
    },
    gePriceRange:(data,wantskip)=>{
        return new Promise(async(resolve,reject)=>{
            let skipp = wantskip || 0
            let start = Number(data.start)
            let end = Number(data.end)
            let count = await Product.countDocuments({OfferPrize:{$gte:start, $lte:end}})
            let datas = await Product.find({OfferPrize:{$gte:start, $lte:end}},(err,result)=>{
                if(err){
                    console.log(err)
                }
            }).limit(6)
            .skip(Number(skipp)).lean() 

            resolve({re:datas,c:count})
        })
    }
}