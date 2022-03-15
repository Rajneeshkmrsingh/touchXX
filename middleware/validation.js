function validateEmail(req,res,next){
    if(req.body.email.includes("@")){
        next();
    }else{
        res.json({
            status:0,
            msg:"Invalid Email ",
        })
    }
}
module.exports = {
    validateEmail
}