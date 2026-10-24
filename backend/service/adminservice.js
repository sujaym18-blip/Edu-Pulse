
const Transaction = require('../models/da'); 
const RoomAvailability = require('../models/hosteldetail/room');
let Books = require('../models/Book');
const Student = require('../models/admission');
const Staff = require('../models/staff');
const StaffAttendance = require('../models/attendance');
const StudentAttendance = require('../models/studentattendance');
const fs = require("fs");
const path = require("path");
let rec=require("../models/admin");
let jwt=require("jsonwebtoken");
let bct=require("bcryptjs");

exports.adminregister = async (req, res) => {
  try {
    console.log("req", req.body);
    let email = req.body.email;
    let password = req.body.password;
    let contact = req.body.contact;
    let city = req.body.city;
    let organization = req.body.organization;

    if (!email || !password) {
      return res.status(400).json({ success: false, msg: "Email and password are required" });
    }

    let exist = await rec.findOne({ email: email });
    if (exist) {
      return res.status(400).json({ success: false, msg: "Admin with this email already exists" });
    }

    let hp = await bct.hash(password, 10);
    let data = await rec.find();
    let id = data.length + 1;
    let record = new rec({
      email: email,
      password: hp,
      contact: contact,
      city: city,
      organization: organization,
      id: id,
    });
    await record.save();
    return res.status(201).json({ success: true, msg: "admin registered successfully" });
  } catch (error) {
    console.error("Admin registration error:", error);
    return res.status(500).json({ success: false, msg: error.message || "Failed to register admin" });
  }
};

exports.adminlogin=async(req,res)=>
{
    let email=req.body.email;
    let password=req.body.password;
    let data=await rec.findOne({email:email});
    if(!data)
    {
        return res.status(404).json({success: false,msg:'admin not found'})
    }
        lpass=data.password;
        pass=await bct.compare(password,lpass); 

        if(pass)
            {
                const secret = process.env.JWT_SECRET;
                if (!secret || secret.length < 32) {
                    return res.status(503).json({
                        success: false,
                        msg: "Admin authentication is not configured. Set JWT_SECRET to at least 32 characters.",
                    });
                }
                let token=jwt.sign({token:data.email, role:"admin"}, secret, {
                    expiresIn:"1d",
                    algorithm:"HS256"
                });
                res.cookie('emtoken', token);
                 return res.status(200).json({success: true,msg:'admin login successfully',token})
                                             
            }
            else
            {
                return res.status(400).json({success: false,msg:'admin login failed'})
            }



}
exports.adminprofile=async(req,res)=>
{
const admin = req.admin;
return res.status(200).json({success: true,msg: "admin profile fetched successfully",profile:
     {email:admin.email,contact:admin.contact,city:admin.city,organization:admin.organization,id:admin.id,image:admin.image},
    });
}

exports.updateAdminProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, msg: "Please choose an image to upload." });
  }

  try {
    const admin = await rec.findByIdAndUpdate(
      req.admin._id,
      { $set: { image: req.file.filename } },
      { new: true, runValidators: true }
    ).select("email contact city organization id image");

    if (!admin) {
      fs.unlink(req.file.path, error => {
        if (error) console.error("Unable to remove orphaned admin profile image:", error);
      });
      return res.status(404).json({ success: false, msg: "Admin profile was not found." });
    }

    if (req.admin.image) {
      const oldImagePath = path.join(__dirname, "../public/images", path.basename(req.admin.image));
      fs.unlink(oldImagePath, error => {
        if (error && error.code !== "ENOENT") {
          console.error("Unable to remove previous admin profile image:", error);
        }
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Profile image updated successfully.",
      profile: {
        email: admin.email,
        contact: admin.contact,
        city: admin.city,
        organization: admin.organization,
        id: admin.id,
        image: admin.image,
      },
    });
  } catch (error) {
    console.error("Error updating admin profile image:", error);
    fs.unlink(req.file.path, unlinkError => {
      if (unlinkError) console.error("Unable to remove failed admin profile upload:", unlinkError);
    });
    return res.status(500).json({ success: false, msg: "Unable to update profile image." });
  }
};


exports.adminlogout=async(req,res)=>
{
    res.clearCookie('emtoken', { path: '/' });
    return res.status(200).json({ success: true, msg: 'Admin logged out successfully' });
}
exports.dashboard = async (req, res) => {
    try {
        const roomDoc = await RoomAvailability.findOne({});
        const singleRooms = roomDoc ? roomDoc.singleRooms : 0;
        const doubleRooms = roomDoc ? roomDoc.doubleRooms : 0;
        const totalRooms = singleRooms + doubleRooms;
        
        const booksIssued = await Transaction.countDocuments({ action: 'issued' }); 
        
        const totalStudents = await Student.countDocuments({});
        
        const totalStaff = await Staff.countDocuments({});
        
        const totalBooks = await Books.countDocuments({});

        const roomsOccupied = 15; 
        
        const dashboardStats = {
            total: totalRooms,
            roomsOccupied: roomsOccupied,
            totalStock: totalBooks,
            issued: booksIssued,
            students: totalStudents,
            staff: totalStaff,
        };
        
        res.status(200).json({
            success: true,
            data: dashboardStats,
            message: 'Dashboard statistics retrieved successfully.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching counts.',
            error: error.message
        });
    }
};

exports.dashboardAttendance = async (req, res) => {
    const year = new Date().getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const getMonthlyAttendance = async (AttendanceModel) => {
        const monthlyRecords = await AttendanceModel.aggregate([
            { $match: { date: { $regex: `^${year}-` } } },
            {
                $group: {
                    _id: {
                        month: { $substrCP: ['$date', 5, 2] },
                        status: '$status',
                    },
                    count: { $sum: 1 },
                },
            },
        ]);

        const months = Array.from({ length: 12 }, () => ({ Full: 0, Half: 0, Leave: 0 }));
        monthlyRecords.forEach(({ _id, count }) => {
            const monthIndex = Number(_id.month) - 1;
            if (monthIndex >= 0 && monthIndex < months.length && Object.hasOwn(months[monthIndex], _id.status)) {
                months[monthIndex][_id.status] = count;
            }
        });

        return months.map(({ Full, Half, Leave }) => {
            const total = Full + Half + Leave;
            return total === 0 ? null : Math.round(((Full + Half * 0.5) / total) * 100);
        });
    };

    try {
        const [staff, students] = await Promise.all([
            getMonthlyAttendance(StaffAttendance),
            getMonthlyAttendance(StudentAttendance),
        ]);

        return res.status(200).json({
            success: true,
            data: { year, labels: monthNames, staff, students },
        });
    } catch (error) {
        console.error('Dashboard attendance statistics error:', error);
        return res.status(500).json({
            success: false,
            msg: 'Unable to fetch attendance statistics.',
        });
    }
};