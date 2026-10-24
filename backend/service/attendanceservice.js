let rec=require("../models/attendance");

const isValidAttendance = record =>
  record !== null &&
  typeof record === "object" &&
  Number.isFinite(Number(record.id)) &&
  typeof record.date === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
  ["Full", "Half", "Leave"].includes(record.status);

exports.viewattendance = async (req, res) => {
  try {
    const filter = req.query.date ? { date: req.query.date } : {};
    const attendancelist = await rec.find(filter).sort({ date: -1, id: 1 });

    return res.status(200).json({
      success: true,
      msg: attendancelist.length === 0 ? "No attendance records found" : "All attendance records fetched successfully",
      attendance: attendancelist,
    });
  } catch (error) {
    console.error("Error fetching staff attendance:", error);
    return res.status(500).json({ success: false, msg: "Unable to fetch attendance records." });
  }
};

exports.addattendance = async (req, res) => {
  try {
    if (!isValidAttendance(req.body)) {
      return res.status(400).json({ success: false, msg: "A valid staff ID, date, and attendance status are required." });
    }

    await rec.findOneAndUpdate(
      { id: Number(req.body.id), date: req.body.date },
      { $set: { status: req.body.status } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ success: true, msg: "Attendance saved successfully." });
  } catch (error) {
    console.error("Error saving staff attendance:", error);
    return res.status(500).json({ success: false, msg: "Unable to save attendance records." });
  }
};

exports.attendancecheck = async (req, res) => {
  const records = req.body?.records;
  if (!Array.isArray(records) || records.length === 0 || records.some(record => !isValidAttendance(record))) {
    return res.status(400).json({
      success: false,
      msg: "Provide at least one attendance record with a valid staff ID, date, and status.",
    });
  }

  try {
    await rec.bulkWrite(records.map(record => ({
      updateOne: {
        filter: { id: Number(record.id), date: record.date },
        update: { $set: { status: record.status } },
        upsert: true,
      },
    })), { ordered: true });

    return res.status(200).json({
      success: true,
      msg: "Attendance records saved successfully.",
      count: records.length,
    });
  } catch (error) {
    console.error("Error saving staff attendance:", error);
    return res.status(500).json({ success: false, msg: "Unable to save attendance records." });
  }
};