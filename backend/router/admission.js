let express=require("express");
let auth=require("../middleware/admission");
let auths=require("../middleware/admin");
let authss=require("../middleware/staff");
let router=express.Router();
const multer = require("multer");
let upload =multer({ 
    storage:multer.diskStorage({
        destination:(req, file, cb)=>{
            cb(null,"./public/images");
        },
        filename:(req,file,cb)=>{
            cb(null, file.originalname);
        }
    })
})

const { admission,admissionlogin,studentprofile,viewstudent,viewbyids,payfee,studentprofile2, updatestudent, viewbyidstudent, deleteadmittedstudent} = require("../controller/admissioncontroller");
const { studentdashboard } = require("../service/admissionservice");
const { requestStudentPasswordReset, resetStudentPassword } = require("../controller/passwordresetcontroller");
router.post("/admission",admission);
router.post("/admissionlogin",admissionlogin);
router.post("/student/forgot-password",requestStudentPasswordReset);
router.post("/student/reset-password",resetStudentPassword);
router.get("/admstudentprofile",auth,studentprofile);
router.get("/studentprofile",auth,studentprofile);
router.get("/student/dashboard",auth,studentdashboard);
router.get("/admin/viewstudent",auths,viewstudent);
router.get("/viewstudent",authss,viewstudent);
router.delete("/deletestudent/:id",auths,deleteadmittedstudent);
router.get("/staff/viewbyidstudent/:id",authss,viewbyidstudent);
router.post("/payfees",auth,payfee);
router.get("/viewbyids/:id",viewbyids);
router.get("/studentprofile2",auth,studentprofile2);
router.put("/updatestudent/:id",updatestudent);
router.get("/viewbyidstudent/:id",viewbyidstudent);

module.exports=router;