let express=require("express");
let auth=require("../middleware/staff");
let auths=require("../middleware/admin");
let router=express.Router();

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const staffImagesDir = path.join(__dirname, "../public/images");
fs.mkdirSync(staffImagesDir, { recursive: true });

const uploadStaffProfileImage = multer({
    storage: multer.diskStorage({
        destination: staffImagesDir,
        filename: (req, file, cb) => {
            cb(null, `staff-${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname).toLowerCase()}`);
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

const handleStaffProfileImageUpload = (req, res, next) => {
    uploadStaffProfileImage.single("image")(req, res, error => {
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

const { staffregister, stafflogin, staffprofile, updateStaffProfileImage, stafflogout, viewstaff,deletestaff ,updatestaff,viewbyid,staffdashboard} = require("../controller/staffcontroller");
const { requestStaffPasswordReset, resetStaffPassword } = require("../controller/passwordresetcontroller");
router.post("/staffregister",upload.single("image"),staffregister);
router.post("/stafflogin",stafflogin);
router.post("/staff/forgot-password",requestStaffPasswordReset);
router.post("/staff/reset-password",resetStaffPassword);
router.get('/staffprofile',auth,staffprofile);
router.put("/staffprofile/image",auth,handleStaffProfileImageUpload,updateStaffProfileImage);
router.get("/staff/dashboard",auth,staffdashboard);
router.get("/stafflogout",stafflogout);
router.get("/viewstaff",auths,viewstaff);
router.delete("/deletestaff/:id",auths,deletestaff);
router.put("/updatestaff/:id",upload.single("image"),updatestaff);
router.get("/viewbyidstaff/:id",viewbyid);
module.exports=router;