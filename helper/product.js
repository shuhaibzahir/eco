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
    getAllProduct: () => {
        return new Promise((resolve, reject) => {
            Product.find({}, (err, data) => {
                if (err) {
                    reject(err)
                } else {
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
                    console.log(resultOfUpdate)
                    resolve(resultOfUpdate)
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
        return new Promise(async(resolve, reject) => {
           let details =  await Banner.find({}).sort({
                created: -1
            }).limit(5).lean()
            let spbanner =  await spBanner.find({}).sort({
                created: -1
            }).limit(1).lean()
            let data={}
             if(details.length!=0&&spbanner.length!=0){
                 resolve({main:details,sp:spbanner})
             }else{
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

            newSpBanner.save((err,room)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(room)
                }
            })

        })
    },
    getAllSpecialBanner:()=>{
        return new Promise((resolve,reject)=>{
             spBanner.find({},(err,result)=>{
                 if(err){
                     reject(err)
                 }else{
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
    deleteSpBanner:(id)=>{
        return new Promise((resolve,reject)=>{
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
    }
}