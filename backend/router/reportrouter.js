let express=require("express");
let auth=require("../middleware/staff");
let auths=require("../middleware/admission");
let { subjectregister, unittest1, unittest2, midTerm, final,viewsubjects, studentSubjects, getunittest1, getunittest2, getmidTerm, getfinal }=require("../controller/reportcontroller");
let router=express.Router();

router.post("/subjectregister",auth,subjectregister);
router.post("/unittest1",auth,unittest1);
router.post("/unittest2",auth,unittest2);
router.post("/midTerm",auth,midTerm);
router.post("/final",auth,final);
router.get("/getunittest1",auths,getunittest1);
router.get("/getunittest2",auths,getunittest2);
router.get("/getmidTerm",auths,getmidTerm);
router.get("/getfinal",auths,getfinal);
router.get("/viewsubjects",auths,viewsubjects);
router.get("/staff/viewsubjects",auth,viewsubjects);
router.get("/student/subjects",auths,studentSubjects);

module.exports=router;