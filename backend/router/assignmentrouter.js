const express = require("express");
const router = express.Router();
const auth=require("../middleware/staff");
const auths=require("../middleware/admission");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { create,view,submission, viewsubmission, assfeedback,viewassfeedback, findSubmissionById, studentViewSubmission } = require("../controller/assignmentcontroller");


const uploadsDir = path.join(__dirname, "../public/uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); 
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); 
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true); 
  } else {
    cb(new Error("Only PDF files are allowed!"), false); 
  }
};

const upload = multer({ storage, fileFilter }); 
router.post("/create",auth, upload.single("Assignment"), create);
router.get("/view",auths,view);
router.post("/submission",auths,upload.single("submissionFile"),submission);
router.get("/viewsubmission",auth,viewsubmission);
router.post("/assfeedback",auth,assfeedback);
router.get("/viewassfeedback",auths,viewassfeedback);
router.get("/findSubmissionById/:id",auth,findSubmissionById);
router.get("/studentViewSubmission",auths,studentViewSubmission);
module.exports = router;
