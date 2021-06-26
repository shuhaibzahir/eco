const mongoose = require("mongoose");
var Float = require('mongoose-float').loadType(mongoose, 2);
const ProductSchema = new mongoose.Schema({
    Name: String,
    Type: String,
    Brand: String,
    Prize: {
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

    deleteSub: (sec, opt, item) =>{
        return new Promise((resolve,reject)=>{
            
           Category.updateOne({section:sec},
                {$pull:{[opt]:item}},
                (err,result)=>{
                    if(err){
                        reject(err)
                    }else{
                        console.log(result)
                        resolve(true)
                    }
                }
                )
        })
    }, 

// ......................... sub category  ending...............
   
//  .................add product.................
   
    addProduct:(datas, tags) => {
        return new Promise((resolve, reject) => {
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

    delteProduct:(id)=>{
        return new Promise((resolve,reject)=>{
            Product.findOneAndDelete({_id:id},(err,result)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(result)
                }
            })
        })

    }
}