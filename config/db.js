const mongoose = require('mongoose');
module.exports={
   dbConnect(dburl){
    mongoose.connect(dburl+'Zeebra', {useNewUrlParser: true,useUnifiedTopology: true });
    }
   }