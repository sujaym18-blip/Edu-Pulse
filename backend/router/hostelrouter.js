let express=require("express");
const { addroom, viewroom, updateroom, studentregister, feespayment } = require("../controller/hostelcontroller");
let router=express.Router();
let auth=require("../middleware/admission");
let auths=require("../middleware/admin");
const { viewstudenthostel, viewfees } = require("../service/hostelservice");

router.post("/addroom",auths,addroom);
router.get("/viewroom",auths,viewroom);
router.put("/updateroom/:id",auths,updateroom);
router.post("/studentregister",auth,studentregister);
router.post("/feespayment",auth,feespayment);
router.get("/viewstudenthostel",auth,viewstudenthostel);
router.get("/viewfees",auth,viewfees);
module.exports=router;