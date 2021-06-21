var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
res.render("userpages/main")
});

router.get("/login",function(req,res){
    res.render("userpages/userlogin")
})



module.exports = router;
