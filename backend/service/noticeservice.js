
let notice = require("../models/notice");

exports.addnotice = async (req, res) => {
    let title = req.body.title;
    let content = req.body.content;
    let type=req.body.type;
    let eventDate = req.body.eventDate;
    let issueDate = req.body.issueDate;
  
  let data = new notice({ title:title, content:content, eventDate:eventDate, issueDate:issueDate,type:type });
  await data.save();
  
  return res.status(201).json({ success: true, msg: "Notice got registered" });
};

exports.viewnotice = async (req, res) => {
  try {
    const noticelist = await notice.find().sort({ issueDate: -1 });

    return res.status(200).json({
      success: true,
      msg: noticelist.length === 0 ? "No notices found" : "All notices fetched successfully",
      notices: noticelist,
    });
  } catch (error) {
    console.error("Error fetching notices:", error);
    return res.status(500).json({ success: false, msg: "Unable to fetch notices." });
  }
};

exports.deletenotice = async (req, res) => {
  let id = req.params.id;
  await notice.deleteOne({ _id: id });
  
  return res.status(200).json({ success: true, msg: "Deleted successfully!!" });
};
