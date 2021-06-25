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
    section: Object
})

const CategoryM = mongoose.model('Categoryms', categorySchema);






module.exports = {
    sectionManage: (sec) => {
        return new Promise((resolve, reject) => {
            CategoryM.find({}, function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    if (result.length == 0) {
                        const newSection = new CategoryM({
                            section: {
                                name: sec,
                                brand: [],
                                ptype: [],
                                category: []
                            }
                        })
                        newSection.save((err, result) => {
                            if (err) {
                                reject(err)
                            } else {
                                resolve(result)
                            }
                        })
                    } else {
                        result.forEach((item) => {

                            if (item.section.name == sec) {

                                reject("Section Already Exist")
                            } else {

                                const newSection = new CategoryM({
                                    section: {
                                        name: sec,
                                        brand: [],
                                        ptype: [],
                                        category: []
                                    }
                                })
                                newSection.save((err, result) => {
                                    if (err) {
                                        reject(err)
                                    } else {
                                        resolve(result)
                                    }
                                })
                            }
                        })
                    }


                }
            })
        })
    },
    updateSubCat: (opt, fullDetails) => {
        return new Promise(async (resolve, reject) => {
            var itemId;
            await CategoryM.find({}, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    result.forEach((items) => {
                        if (items.section.name == fullDetails.section) {
                            itemId = items._id;
                        }
                    })
                }
            })
            console.log(itemId)
            let brand = false;
            let ptype = false;
            let catgory = false;
            if(fullDetails.option=="brand"){
                brand=true;
            }else if(fullDetails.option=="ptype"){
                ptype=true;

            }else if(fullDetails.option=="category"){
                
            }


        })
    },
    getSectionData: () => {
        return new Promise((resolve, reject) => {
            CategoryM.find({}, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    resolve(result)
                }

            }).lean()
        })
    },


    // product adding
    addProduct: (datas, tags) => {
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
    }
}