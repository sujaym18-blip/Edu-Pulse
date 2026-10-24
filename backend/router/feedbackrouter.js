let express=require("express");
const {addfeedback,viewfeedback,feedbackRatings } = require("../controller/feedback");
const adminAuth = require("../middleware/admin");
let router=express.Router();

router.post("/addfeedback",addfeedback);
router.get("/viewfeedback",viewfeedback);
router.get("/feedback/ratings",adminAuth,feedbackRatings);



module.exports=router;