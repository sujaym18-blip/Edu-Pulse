const rec = require("../models/assignment"); 
const rec3 = require("../models/asssubmission"); 
const rec4 = require("../models/assignmentFeedback"); 

exports.create = async (req, res) => {
    let staffId = req.staff.id;
    let staffName = req.staff.name;

    let Id = req.body.Id;
    let Title = req.body.Title;
    let Assignment = req.file.filename;
    let IssueDate = req.body.IssueDate;
    let SubmissionDate = req.body.SubmissionDate;
    let Description = req.body.Description;

    const record = new rec({
        Id: Id,
        Title: Title,
        Assignment: Assignment,
        IssueDate: IssueDate,
        SubmissionDate: SubmissionDate,
        Description: Description,
        staffId: staffId,
        staffName: staffName
    });
    await record.save();
    return res.status(201).json({ success: true, msg: "assignment registered successfully", record });
}


exports.view = async (req, res) => {
    let assignment = await rec.find();
    return res.status(200).json({
        success: true,
        msg: assignment.length === 0 ? "No assignments found" : "All assignment details fetched successfully",
        assignment: assignment,
    });
}

exports.submission = async (req, res) => {
    let stuEmail = req.adm.email;
    let stuName = req.adm.name;
    let stuId = req.adm.id;
    let assignId = req.body.assignId;
    let submissionFile = req.file.filename;

    const assignmentRecord = await rec.findOne({ _id: assignId });

    if (!assignmentRecord) {
        return res.status(404).json({ success: false, msg: "Assignment not found. Please check Assignment ID." });
    }

    const existingSubmission = await rec3.findOne({
        studentId: stuId,
        assignId: assignId
    });

    if (existingSubmission) {
        return res.status(400).json({
            success: false,
            msg: "You have already submitted this assignment once.",
        });
    }

    const staffId = assignmentRecord.staffId;
    const record = new rec3({
        studentId: stuId,
        studentEmail: stuEmail,
        studentName: stuName,
        assignId: assignId,
        submissionFile: submissionFile,
        staffId: staffId,
    });

    await record.save();

    return res.status(201).json({
        success: true,
        msg: "Assignment submitted successfully",
        submission: record,
    });
}

exports.viewsubmission = async (req, res) => {
    let staffId = req.staff.id;
    let submission = await rec3.find({ staffId: staffId });

    return res.status(200).json({
        success: true,
        msg: submission.length === 0 ? "No submissions found for your assignments" : "Submissions fetched successfully",
        submission: submission,
    });
}

exports.assfeedback = async (req, res) => {
    let stuId = req.body.stuId;
    let stuName = req.body.stuName;
    let stuEmail = req.body.stuEmail;
    let assignId = req.body.assignId;

    let feedback = req.body.feedback;
    let marks = req.body.marks;

    const record = new rec4({
        stuId: stuId,
        stuEmail: stuEmail,
        stuName: stuName,
        assignId: assignId,
        feedback: feedback,
        marks: marks,

    });

    await record.save();
    return res.status(201).json({
        success: true,
        msg: "Assignment feedback submitted successfully",
        feed: record,
    });
}


exports.viewassfeedback = async (req, res) => {
    let studentId = req.adm.id;
    let feedback = await rec4.find({ stuId: studentId });

    return res.status(200).json({
        success: true,
        msg: feedback.length === 0 ? "No feedback found for this student" : "Your assignment feedback details fetched successfully",
        feedback: feedback,
    });
}


exports.findSubmissionById = async (req, res) => {
    try {
        const submissionId = req.params.id;
        let submission = await rec3.findById(submissionId);

        if (!submission) {
            return res.status(404).json({
                success: false,
                msg: "No submission found for this assignment ID",
            });
        }

        return res.status(200).json({
            success: true,
            submission: submission,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            msg: "An error occurred while fetching the submission",
        });
    }
};


exports.studentViewSubmission = async (req, res) => {
    let studentId = req.adm.id;
    try {
        const submission = await rec3.find({ studentId: studentId });
        return res.status(200).json({
            success: true,
            msg: submission.length === 0 ? "You have not submitted any assignments yet." : "Your assignment submissions fetched successfully",
            submission: submission,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Server error while fetching submissions", error: error.message });
    }
}