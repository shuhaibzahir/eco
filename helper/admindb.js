const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const AdminSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: Number,
    password: String,
     
})
const Admin = mongoose.model('Admin', AdminSchema);


module.exports={
    // adminSiggnUP:(data)=>{
    // return new Promise ((resolve, reject)=>{
    //     bcrypt.hash(data.password, saltRounds, function (err, hash) {
    //         if(!err){
    //             const addAdmin = new Admin({
    //                 name:data.name, 
    //                 email:data.email,
    //                 phone:data.phone,
    //                 password:hash,
    //             })
    //             addAdmin.save((err,room)=>{
    //                 if(!err){
    //                     resolve(room)
    //                 }else{
    //                     reject(err)
    //                 }
    //             })
    //         }else{
    //             console.log(err)
    //         }
    //     })
         
    // })
    // }

    adminLogin:(admin)=>{
        return new Promise((resolve,reject)=>{
            Admin.findOne({email:admin.email},function(err,result){
                if(err){
                    console.log(err);
                }else{
                    if(result){
                        bcrypt.compare(admin.password, result.password, function(err, check) {
                           if(err){
                               console.log(err)
                           }else{
                            if(check){
                                resolve(result)
                            }else{
                                reject("Email Or Password Not Found")
                            }
                           }
                        })
                    }else{
                        reject("Email Or Password Not Found")
                    }
                }
            }
               
            )
        })
    }
}