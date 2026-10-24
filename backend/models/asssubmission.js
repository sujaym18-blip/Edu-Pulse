let mongo=require("mongoose");
let submission=mongo.Schema({
   studentId:{type:String},
   studentName:{type:String},
   studentEmail:{type:String},
   assignId:{type:String},
   submissionFile:{type:String},
   staffId:{type:String},
   submissionDate:{type:Date, default: Date.now},
});
module.exports=mongo.model('submission',submission);