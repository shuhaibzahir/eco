const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    password: String,
    status: Boolean,
    date  :String,
})
const User = mongoose.model('User', UserSchema);


module.exports = {
    // user sign up function
    userSignup: (userdata,todaydate) => {
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
                                date:todaydate
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
    userSignin: (userdata)=>{
        return new Promise((resolve, reject) => {
            User.findOne({email: userdata.email},function(err,dbdata){
                if(err){
                    console.log(err)
                }else{
                    if(dbdata){
                        bcrypt.compare(userdata.password, dbdata.password, function(err, result) {
                            if(result){
                                resolve(dbdata)
                            }else{
                                reject("Email or Password Mismatch !")
                            }
                        });
                    }else{
                        reject("Email or Password Mismatch !")
                    }
                }
            })
        })
    },
    checkPhone:(ph)=>{
        return new Promise((resolve,reject) =>{
            User.findOne({phone:ph.phone},function(err,result){
                if(err){
                    console.log(err)
                }else{
                    if(result){
                       if(result.status){
                        resolve(result)
                       }else{
                           reject("Your Account Block by Admin")
                       }
                    }else{
                        reject("This number is not Registerd")
                    }
                }
            })
        })
    },
    getOneUser:(id)=>{
        return new Promise((resolve, reject)=>{
            User.findOne({_id:id},function(err,result){
                if(!err){
                    if(result){
                        resolve(result)
                    }else{
                        reject("No User Found")
                    }
                }else{
                    console.log(err)
                }
            })
        })
    },
    getAllUsers:()=>{
        return new Promise((resolve,reject)=>{
            User.find({},(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                    if(result){
                        resolve(result)
                    }else{
                        reject("No Data Found")
                    }
                }
            }).lean()
        })
    },
    changeStatus:(data)=>{
        return new Promise((resolve,reject)=>{
            User.findOne({_id:data.uid},(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                    if(result.status){
                        User.findOneAndUpdate({_id:data.uid},{$set:{status:false}},(err,ok)=>{
                            if(!err){
                                resolve(false)
                            }else{
                                console.log(err)
                            }
                        })
                    }else{
                        User.findOneAndUpdate({_id:data.uid},{$set:{status:true}},(err,ok)=>{
                            if(!err){
                                resolve(true)
                            }else{
                                console.log(err)
                            }
                        })
                    }
                
                }
            })
        })
    }
     
}