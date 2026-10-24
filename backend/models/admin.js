let mongo=require("mongoose");
let adminmodel=mongo.Schema({
   email:{type:String},
   password:{type:String},
   organization:{type:String},
   contact:{type:Number},
   city:{type:String},
   id:{type:Number},
   image:{type:String},
   resetPasswordTokenHash:{type:String, select:false},
   resetPasswordExpiresAt:{type:Date, select:false},

});
module.exports=mongo.model('admin',adminmodel);