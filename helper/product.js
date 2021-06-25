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

const categorySchema = new mongoose.Schema({
    section: String,
    brand: String,
    ptype: {
        type: String,
        default: "Watch"
    },
    category: String,
    

})
// CategoryM is cateogrymanagement
const CategoryM = mongoose.model('Categoryms', categorySchema);






module.exports = {
    categoryManage: (data) => {
        return new Promise((resolve,reject) => {
             
                CategoryM.findOne({
                    $and: [{
                        section: data.section
                    }, {
                        brand: data.brand
                    }, {ptype:data.product_type},
                    {category:data.category},
                    
                ]
                },(err,result)=>{
                    if(!err){
                        if(result){
                            reject("Already have this category")
                        }else{
                            const newCat = new CategoryM({
                                section: data.section,
                                brand: data.brand,
                                ptype: data.product_type,
                                category: data.category,
                                
                            })
    
                            newCat.save((err,result)=>{
                                if(!err){
                                    resolve((result))
                                }else{
                                    console.log(err)
                                }
                            })
                        }
                    }else{
                        reject(err)
                    }
                })
            }
            
        )     
    },
    getAllCat:()=>{
      return new Promise((resolve,reject)=>{
        CategoryM.find({},(err,result)=>{
            if(!err){
                resolve(result)
            }else{
                reject(err)
            }
        }).lean()
      })  
    },
    getCatValues:()=>{
        return new Promise((resolve,reject)=>{
            let watchdata =   CategoryM.aggregate([
                {$match:{section:'watch'}},
                {$group:{_id:{brand:"$brand",category:"$category",ptype:"$ptype"}}}
              ])
              let footweardata =   CategoryM.aggregate([
                {$match:{section:'footwear'}},
                {$group:{_id:{brand:"$brand",category:"$category",ptype:"$ptype"}}}
              ]) 
              let clothdata =   CategoryM.aggregate([
                {$match:{section:'clothes'}},
                {$group:{_id:{brand:"$brand",category:"$category",ptype:"$ptype"}}}
              ]) 
              Promise.all([watchdata,footweardata,clothdata]).then((data)=>{
                  resolve(data)
              }).catch((err)=>{
                  reject(err)
              })

        })
    },
    getOneCategory:(id)=>{
        return new Promise((resolve,reject)=>{
            CategoryM.findOne({_id:id},(err,result)=>{
                if(err){
                    reject(err);
                }else{
                    resolve(result)
                }
            }).lean()
        }) 
    },
    updateCategory:(data)=>{
        return new Promise(async(resolve,reject)=>{
             
            var checked= false;
            console.log("checked")
            // checking the data is existing
           await CategoryM.findOne({
                $and: [{
                    section: data.section
                }, {
                    brand: data.brand
                }, {ptype:data.product_type},
                {category:data.category},
                
            ]
            },(err,result)=>{
                console.log(data.uid)
                console.log(result)
                if(result){
                    if(result._id==data.uid){
                        checked=true;
                    }else{
                        checked=false;
                    }
                }else{
                    checked= true;
                }
            })
            console.log(checked)

            if(checked){
                CategoryM.findOneAndUpdate({_id:data.uid}
                  ,{$set:{
                    section: data.section,
                    brand: data.brand,
                    ptype: data.product_type,
                    category: data.category
                  }} ,function(err){
                      resolve(true)
                  } 
                    )
            }else{
                reject("The Same Data Existed")
            }
        })
    },
    categoryDelete:(id)=>{
        return new Promise((resolve,reject) =>{
            CategoryM.findOneAndDelete({_id:id},(err)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(true)
                }
            })
        })
    },
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
    getAllProduct:()=>{
        return new Promise ((resolve,reject)=>{
            Product.find({},(err,data)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(data)
                }
            }).lean()
        })
    }
}