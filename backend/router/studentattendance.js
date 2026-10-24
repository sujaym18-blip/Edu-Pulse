let express=require("express");
const { stuaddattendance, stuviewattendance ,attendancecheck} = require("../controller/studentattendance");
let auth=require("../middleware/staff");
let adminAuth=require("../middleware/admin");

let router=express.Router();

router.post("/stuaddattendance",auth,stuaddattendance);
router.get("/stuviewattendance",auth,stuviewattendance);
router.get("/admin/stuviewattendance",adminAuth,stuviewattendance);
router.post("/attendancecheck",auth,attendancecheck);
module.exports=router;