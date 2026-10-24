let express=require("express");
let router=express.Router();
let auth=require("../middleware/admission");
let auths=require("../middleware/admin");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const imagesDir = path.join(__dirname, "../public/images");
const uploadsDir = path.join(__dirname, "../public/uploads");
fs.mkdirSync(imagesDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, file.fieldname === "bookFile" ? uploadsDir : imagesDir);
        },
        filename: (req, file, cb) => {
            const extension = path.extname(file.originalname).toLowerCase();
            cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`);
        },
    }),
    limits: { fileSize: 25 * 1024 * 1024, files: 2 },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "bookFile"
            && (file.mimetype !== "application/pdf" || path.extname(file.originalname).toLowerCase() !== ".pdf")) {
            return cb(new Error("The book file must be a PDF."));
        }
        if (file.fieldname !== "bookFile" && file.fieldname !== "image") {
            return cb(new Error("Unsupported book upload field."));
        }
        return cb(null, true);
    },
});

const handleBookUpload = (req, res, next) => {
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "bookFile", maxCount: 1 },
    ])(req, res, error => {
        if (error) {
            return res.status(400).json({
                success: false,
                msg: error.code === "LIMIT_FILE_SIZE"
                    ? "Each uploaded file must be 25 MB or smaller."
                    : error.message || "Unable to upload book files.",
            });
        }
        return next();
    });
};

const { addbook, viewbook, deletebook,issuebook,returnbook,issued,adminIssued,readbook } = require("../controller/librarycontroller");
router.post("/addbook",auths,handleBookUpload,addbook);
router.get("/viewbook",viewbook);
router.get("/admin/issuedbooks",auths,adminIssued);
router.delete("/deletebook/:id",auths,deletebook);
router.get("/readbook/:id",auth,readbook);
router.post("/issuebook",auth,issuebook);
router.post("/returnbook",auth,returnbook);
router.get("/issued",auth,issued);

module.exports=router;