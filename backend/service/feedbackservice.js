const rec = require("../models/feedback");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const Staff = require("../models/staff");
const Student = require("../models/student");
const Admission = require("../models/admission");

const findSubmitter = async (req) => {
  const cookies = req.cookies || {};

  if (cookies.emtoken && process.env.JWT_SECRET) {
    try {
      const adminSession = jwt.verify(cookies.emtoken, process.env.JWT_SECRET, { algorithms: ["HS256"] });
      if (adminSession.role === "admin" && typeof adminSession.token === "string") {
        const admin = await Admin.findOne({ email: adminSession.token });
        if (admin) {
          return {
            name: admin.organization || admin.email,
            email: admin.email,
            role: "Admin",
          };
        }
      }
    } catch (error) {
      if (!(error instanceof jwt.JsonWebTokenError)) throw error;
    }
  }

  if (cookies.emstoken) {
    try {
      const staffSession = jwt.verify(cookies.emstoken, "aabb");
      if (typeof staffSession.token === "string") {
        const staff = await Staff.findOne({ email: staffSession.token });
        if (staff) {
          return { name: staff.name || staff.email, email: staff.email, role: "Staff" };
        }
      }
    } catch (error) {
      if (!(error instanceof jwt.JsonWebTokenError)) throw error;
    }
  }

  const studentToken = cookies.token || cookies.emtoken;
  if (studentToken) {
    try {
      const studentSession = jwt.verify(studentToken, "aabb");
      if (typeof studentSession.token === "string") {
        const [student, admission] = await Promise.all([
          Student.findOne({ email: studentSession.token }),
          Admission.findOne({ email: studentSession.token }),
        ]);
        const submitter = student || admission;
        if (submitter) {
          return {
            name: submitter.name || submitter.email,
            email: submitter.email,
            role: "Student",
          };
        }
      }
    } catch (error) {
      if (!(error instanceof jwt.JsonWebTokenError)) throw error;
    }
  }

  return null;
};

const ratingGroups = [
  { rating: "Needs Improvement (1-3)", min: 1, max: 3 },
  { rating: "Good (4-7)", min: 4, max: 7 },
  { rating: "Excellent (8-10)", min: 8, max: 10 },
];

exports.addfeedback = async (req, res) => {
  try {
    const submitter = await findSubmitter(req);
    if (!submitter) {
      return res.status(401).json({
        success: false,
        msg: "Please sign in to submit feedback with your name.",
      });
    }

    let rating = req.body.rating;
    let comment = req.body.comment;
    let category = req.body.category;

    let data = new rec({
      rating: rating,
      comment: comment,
      category: category,
      submitterName: submitter.name,
      submitterEmail: submitter.email,
      submitterRole: submitter.role,
    });

    await data.save();
    return res
      .status(201)
      .json({ success: true, msg: "Feedback submitted successfully." });
  } catch (error) {
    console.error("Error in submitting feedback:", error);
    return res
      .status(500)
      .json({ success: false, msg: "Error in submitting feedback." });
  }
};

exports.feedbackRatings = async (req, res) => {
  try {
    const groupedRatings = await rec.aggregate([
      { $match: { rating: { $gte: 1, $lte: 10 } } },
      {
        $group: {
          _id: {
            $switch: {
              branches: ratingGroups.map(({ rating, min, max }) => ({
                case: { $and: [{ $gte: ["$rating", min] }, { $lte: ["$rating", max] }] },
                then: rating,
              })),
              default: null,
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    const countsByRating = new Map(groupedRatings.map(({ _id, count }) => [_id, count]));

    return res.status(200).json({
      success: true,
      data: ratingGroups.map(({ rating }) => ({
        rating,
        count: countsByRating.get(rating) || 0,
      })),
    });
  } catch (error) {
    console.error("Error aggregating feedback ratings:", error);
    return res.status(500).json({ success: false, msg: "Unable to fetch feedback ratings." });
  }
};

exports.viewfeedback = async (req, res) => {
    try {
    let feedbackList = await rec.find();

    if (feedbackList.length === 0) {
      return res.status(404).json({ success: false, msg: "No feedback found" });
    }

    return res.status(200).json({
      success: true,
      msg: "All feedbacks fetched successfully",
      feedback: feedbackList,
    });
  } catch (error) {
    console.error("Error in fetching feedback:", error);
    return res.status(500).json({ success: false, msg: "Error in fetching feedback." });
  }
};
