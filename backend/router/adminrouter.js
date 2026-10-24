let express=require("express");
let auth=require("../middleware/admin")
let router=express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { adminregister, adminlogin, adminprofile, updateAdminProfileImage, adminlogout, dashboard, dashboardAttendance } = require("../controller/admincontroller");
const { requestAdminPasswordReset, resetAdminPassword } = require("../controller/passwordresetcontroller");

const adminImagesDir = path.join(__dirname, "../public/images");
fs.mkdirSync(adminImagesDir, { recursive: true });
const uploadAdminImage = multer({
  storage: multer.diskStorage({
    destination: adminImagesDir,
    filename: (req, file, cb) => {
      cb(null, `admin-${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
    if (!allowedTypes.has(file.mimetype) || !allowedExtensions.has(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error("Upload a JPG, PNG, or WEBP image."));
    }
    return cb(null, true);
  },
});

const handleAdminImageUpload = (req, res, next) => {
  uploadAdminImage.single("image")(req, res, error => {
    if (error) {
      return res.status(400).json({
        success: false,
        msg: error.code === "LIMIT_FILE_SIZE"
          ? "Profile image must be 5 MB or smaller."
          : error.message || "Unable to upload profile image.",
      });
    }
    return next();
  });
};

router.post("/adminregister",adminregister);
router.post("/adminlogin",adminlogin);
router.post("/admin/forgot-password",requestAdminPasswordReset);
router.post("/admin/reset-password",resetAdminPassword);
router.get('/adminprofile',auth, adminprofile);
router.put("/adminprofile/image",auth,handleAdminImageUpload,updateAdminProfileImage);
router.get("/adminlogout",auth,adminlogout);
router.get("/dashboard",dashboard);
router.get("/admin/dashboard/attendance",auth,dashboardAttendance);

module.exports=router;