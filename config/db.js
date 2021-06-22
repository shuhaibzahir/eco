const mongoose = require('mongoose');
module.exports={
   dbConnect(dburl){
    mongoose.connect(dburl+'myapp', {useNewUrlParser: true,useUnifiedTopology: true });
    }
   }