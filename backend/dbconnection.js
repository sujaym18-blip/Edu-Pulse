const dotenv=require("dotenv");
dotenv.config();
let mongo=require("mongoose");
exports.erp=()=>
{
mongo.connect(process.env.MONGODB_URI)
console.log('Mongo db successfully connected')
}