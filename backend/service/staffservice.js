let rec = require("../models/staff");
let jwt = require("jsonwebtoken");
let bct = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const StudentAccount = require("../models/student");
const AdmittedStudent = require("../models/admission");
const Assignment = require("../models/assignment");
const StudentAttendance = require("../models/studentattendance");
const Submission = require("../models/asssubmission");
const Notice = require("../models/notice");

exports.staffregister = async (req, res) => {
  try {
    console.log("req", req.body);
    let email = req.body.email;
    let name = req.body.name;
    let password = req.body.password;
    let contact = req.body.contact;
    let city = req.body.city;
    let address = req.body.address;
    let image = req.file ? req.file.filename : (req.body.image || "");
    let department = req.body.department;
    
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, msg: "Name, email, and password are required" });
    }

    let hp = await bct.hash(password, 10);
    let exist = await rec.findOne({ email: email });
    if (exist) {
      return res.status(400).json({ success: false, msg: "Staff with this email already exists" });
    } else {
      let data = await rec.find();
      const id = data.length + 1;
      let record = new rec({
        email: email,
        password: hp,
        contact: contact,
        city: city,
        name: name,
        address: address,
        id: id,
        image: image,
        department: department,
      });
      await record.save();
      return res
        .status(201)
        .json({ success: true, msg: "staff registered successfully" });
    }
  } catch (error) {
    console.error("Staff registration error:", error);
    return res.status(500).json({ success: false, msg: error.message || "Failed to register staff" });
  }
};

exports.stafflogin = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  console.log("email",email);
  console.log("password",password);
  let data = await rec.findOne({ email: email });
  if (!data) {
    return res.status(404).json({ success: false, msg: "staff not found" });
  }
  lpass = data.password;
  pass = await bct.compare(password, lpass);
  console.log(pass);
  if (pass) {
    
                    let token=jwt.sign({token:data.email},"aabb",{
                        expiresIn:"1d"
                    });

                    res.cookie('emstoken', token);
                   console.log("send token"+token);
    return res
      .status(200)
      .json({ success: true, msg: "staff login successfully",token:token});
  } else {
    return res.status(400).json({ success: false, msg: "staff login failed" });
  } 
};


exports.staffprofile = async (req, res) => {
  console.log("hi");
  let staff=req.staff;
  console.log(staff);
  return res
    .status(200)
    .json({
      success: true,
      msg: "staff profile fetched successfully",
      profile:{ email: staff.email,
        name:staff.name,
        contact: staff.contact,
        city: staff.city,
        name: staff.name,
        address: staff.address,
        id: staff.id,
        image: staff.image,
        department:staff.department,},
    });
};

exports.updateStaffProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, msg: "Please choose an image to upload." });
  }

  try {
    const staff = await rec.findByIdAndUpdate(
      req.staff._id,
      { $set: { image: req.file.filename } },
      { new: true, runValidators: true }
    ).select("email name contact city address id image department");

    if (!staff) {
      fs.unlink(req.file.path, error => {
        if (error) console.error("Unable to remove orphaned staff profile image:", error);
      });
      return res.status(404).json({ success: false, msg: "Staff profile was not found." });
    }

    if (req.staff.image) {
      const oldImagePath = path.join(__dirname, "../public/images", path.basename(req.staff.image));
      fs.unlink(oldImagePath, error => {
        if (error && error.code !== "ENOENT") {
          console.error("Unable to remove previous staff profile image:", error);
        }
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Profile image updated successfully.",
      profile: {
        email: staff.email,
        name: staff.name,
        contact: staff.contact,
        city: staff.city,
        address: staff.address,
        id: staff.id,
        image: staff.image,
        department: staff.department,
      },
    });
  } catch (error) {
    console.error("Error updating staff profile image:", error);
    fs.unlink(req.file.path, unlinkError => {
      if (unlinkError) console.error("Unable to remove failed staff profile upload:", unlinkError);
    });
    return res.status(500).json({ success: false, msg: "Unable to update profile image." });
  }
};

exports.stafflogout = async (req, res) => {
  res.clearCookie("emstoken", { path: '/' });
  return res.status(200).json({ success: true, msg: 'Staff logged out successfully' });
};

exports.viewstaff = async (req, res) => {
  let stafflist = await rec.find();

  return res.status(200).json({
    success: true,
    msg: stafflist.length === 0 ? "No staff found" : "All staff details fetched successfully",
    staff: stafflist,
  });
};

exports.staffdashboard = async (req, res) => {
  try {
    const staffId = String(req.staff.id);
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const formatDate = date => [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    const firstActivityDate = new Date(today);
    firstActivityDate.setDate(firstActivityDate.getDate() - 6);
    const firstActivityDay = formatDate(firstActivityDate);
    const lastActivityDay = formatDate(today);

    const nextActivityDate = new Date(today);
    nextActivityDate.setDate(nextActivityDate.getDate() + 1);
    const [studentEmails, admittedStudentEmails, assignments, attendanceRecords, weeklySubmissions, submissions, recentNotices, nextEvent] = await Promise.all([
      StudentAccount.distinct("email"),
      AdmittedStudent.distinct("email"),
      Assignment.find({ staffId }).select("_id Title IssueDate SubmissionDate").lean(),
      StudentAttendance.find({
        date: { $gte: firstActivityDay, $lte: lastActivityDay },
      }).select("date").lean(),
      Submission.find({
        staffId,
        submissionDate: { $gte: firstActivityDate, $lt: nextActivityDate },
      }).select("submissionDate").lean(),
      Submission.find({ staffId }).sort({ submissionDate: -1 }).limit(5).lean(),
      Notice.find().sort({ issueDate: -1 }).limit(3).lean(),
      Notice.findOne({ eventDate: { $gte: now } }).sort({ eventDate: 1 }).lean(),
    ]);
    const totalStudents = new Set(
      [...studentEmails, ...admittedStudentEmails]
        .filter(email => typeof email === "string" && email.trim())
        .map(email => email.trim().toLowerCase())
    ).size;

    const assignmentById = new Map(assignments.map(assignment => [
      String(assignment._id),
      assignment,
    ]));
    const activeAssignments = assignments.filter(assignment =>
      assignment.IssueDate <= now && assignment.SubmissionDate >= today
    ).length;
    const attendanceByDate = new Map();
    attendanceRecords.forEach(record => {
      attendanceByDate.set(record.date, (attendanceByDate.get(record.date) || 0) + 1);
    });
    const submissionsByDate = new Map();
    weeklySubmissions.forEach(submission => {
      const submissionDay = formatDate(new Date(submission.submissionDate));
      submissionsByDate.set(submissionDay, (submissionsByDate.get(submissionDay) || 0) + 1);
    });
    const recentSubmissions = submissions.map(submission => {
      return {
        _id: submission._id,
        studentName: submission.studentName,
        assignmentTitle: assignmentById.get(String(submission.assignId))?.Title || "Assignment",
        submissionDate: submission.submissionDate,
      };
    });
    const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(firstActivityDate);
      date.setDate(date.getDate() + index);
      const day = formatDate(date);
      return {
        date: day,
        attendance: attendanceByDate.get(day) || 0,
        submissions: submissionsByDate.get(day) || 0,
      };
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        totalStudents,
        activeAssignments,
        weeklyActivity,
        recentSubmissions,
        recentNotices,
        nextEvent,
      },
    });
  } catch (error) {
    console.error("Staff dashboard data error:", error);
    return res.status(500).json({
      success: false,
      msg: "Unable to load staff dashboard data.",
    });
  }
};

exports.deletestaff = async (req, res) => {
  console.log("hello");
  let id = req.params.id;
  await rec.deleteOne({ _id: id });
  return res.status(200).json({ success: true, msg: "delete successfully!!" });
};

exports.updatestaff = async (req, res) => {
  console.log("hiiii");

  let id = req.params.id;
  let updatedData = req.body;
  let record = await rec.findByIdAndUpdate({ _id: id }, updatedData, {
    new: true,
  });

  if (!record) {
    return res
      .status(404)
      .json({ success: false, msg: "Department not found" });
  }

  console.log(record);

  return res
    .status(200)
    .json({
      success: true,
      msg: "Department updated successfully",
      staff: record,
    });
};

exports.viewbyid=async(req,res)=>
{
  try {
    const staffId = req.params.id;
    console.log("Staff ID:", staffId);
    let staff = await rec.findOne({ _id: staffId });
    if (!staff) {
      return res.status(404).json({ success: false, msg: "Staff not found" });
    }
    return res.status(200).json({
      success: true,
      msg: "Staff details fetched successfully",
      staff: staff,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
}
