const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const UserSchema = new mongoose.Schema({
    name:String,
    email:String,
    phone:Number,
    password:String,
    status:Boolean,
})
const User = mongoose.model('User',UserSchema);
 

module.exports={
    // user sign up function
   userSignup:(userdata)=>{
       return new Promise((resolve, reject)=>{
        //    hashing password
        bcrypt.hash(userdata.password, saltRounds, function(err, hash) {
             if(!err){
                const dataUp = new User({
                    name:userdata.name,
                    email:userdata.email,
                    phone:userdata.phone,
                    password:hash,
                    status:true,
                   })
                   dataUp.save((err,room)=>{
                       if(err){
                           reject(err)
                       }else{
                           resolve(room)
                       }
                   });
             }else{
                 throw err
             }
        });
         
       })
   }
}