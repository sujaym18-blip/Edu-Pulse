let rec2=require("../models/marks");
let rec=require("../models/subjects");
const Department = require("../models/department");

const normalizeDepartment = value => String(value || "")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "");

const departmentAliases = {
  cse: ["computerscienceengineering"],
  mech: ["mechanicalengineering"],
  eec: ["eee", "electricalelectronicsengineering"],
  eee: ["eec", "electricalelectronicsengineering"],
  civil: ["civilengineering"],
};

const departmentKeys = value => {
  const normalized = normalizeDepartment(value);
  if (!normalized) return [];
  const keys = [normalized, ...(departmentAliases[normalized] || [])];
  const acronym = String(value || "")
    .trim()
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .toLowerCase();
  if (acronym) keys.push(acronym, ...(departmentAliases[acronym] || []));
  return [...new Set(keys)];
};

const departmentMatches = (left, right) => {
  const rightKeys = departmentKeys(right);
  return departmentKeys(left).some(key => rightKeys.includes(key));
};

exports.subjectregister=async(req,res)=>
{
  try {
    const departmentId = String(req.body.departmentId || "").trim();
    const departmentRef = String(req.body.departmentRef || "").trim();
    const requestedDepartmentName = String(req.body.departmentName || "").trim();
    const subjectNames = Array.from({ length: 6 }, (_, index) =>
      String(req.body[`subject${index + 1}`] || "").trim()
    );

    if ((!departmentId && !departmentRef) || !requestedDepartmentName || subjectNames.some(name => !name)) {
      return res.status(400).json({
        success: false,
        msg: "Select a department and provide all six subject names.",
      });
    }

    const departments = await Department.find().select("departId departName").lean();
    const department = departments.find(item =>
      String(item._id) === departmentRef ||
      (departmentId && String(item.departId) === departmentId) ||
      departmentMatches(item.departName, requestedDepartmentName)
    );
    if (!department) {
      return res.status(400).json({ success: false, msg: "Selected department was not found." });
    }
    const departmentName = department.departName;
    const values = {
      branch: departmentName,
      departmentId: String(department.departId ?? ""),
      departmentName,
      departmentRef: String(department._id),
    };
    subjectNames.forEach((name, index) => {
      values[`subject${index + 1}`] = name;
    });

    const legacyKeys = [...new Set([
      departmentId,
      departmentName,
      ...departmentKeys(departmentId),
      ...departmentKeys(departmentName),
    ])];
    const existingSubject = await rec.findOne({
      $or: [
        { departmentRef: String(department._id) },
        { departmentId: String(department.departId ?? "") },
        { branch: { $in: legacyKeys } },
        { departmentName: { $in: legacyKeys } },
      ],
    });

    const subject = existingSubject
      ? await rec.findByIdAndUpdate(existingSubject._id, values, { new: true, runValidators: true })
      : await rec.create(values);

    return res.status(200).json({
      success: true,
      msg: "Subjects registered successfully.",
      subject,
    });
  } catch (error) {
    console.error("Subject registration error:", error);
    return res.status(500).json({ success: false, msg: "Unable to register subjects." });
  }
}

exports.viewsubjects=async(req,res)=>
{
  try {
    const data = await rec.find().lean();
    return res.status(200).json({success:true,msg:"subjects fetched successfully",subject:data});
  } catch (error) {
    console.error("Subject list error:", error);
    return res.status(500).json({success:false,msg:"Unable to fetch subjects."});
  }
}

exports.studentSubjects = async (req, res) => {
  try {
    const studentDepartment = String(req.adm.department || "").trim();
    if (!studentDepartment) {
      return res.status(404).json({ success: false, msg: "No department is assigned to this student." });
    }

    const departments = await Department.find().select("departId departName").lean();
    const matchingDepartments = departments.filter(department =>
      departmentMatches(studentDepartment, department.departId) ||
      departmentMatches(studentDepartment, department.departName)
    );
    const departmentValues = [
      studentDepartment,
      ...matchingDepartments.flatMap(department => [
        department._id,
        department.departId,
        department.departName,
      ]),
    ];
    const subjectEntries = await rec.find().lean();
    const subject = subjectEntries.find(entry =>
      [entry.branch, entry.departmentId, entry.departmentName, entry.departmentRef]
        .some(subjectDepartment => departmentValues.some(value =>
          departmentMatches(subjectDepartment, value)
        ))
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        msg: `Subjects have not been registered for ${studentDepartment}.`,
      });
    }

    return res.status(200).json({ success: true, subject });
  } catch (error) {
    console.error("Student subject lookup error:", error);
    return res.status(500).json({ success: false, msg: "Unable to fetch your department subjects." });
  }
}

exports.unittest1 = async (req,res) => {
    try{
      console.log("req body",req.body);
    let studentId=req.body.studentId;
    let subject1=req.body.subject1;
    let subject2=req.body.subject2;
    let subject3=req.body.subject3;
    let subject4=req.body.subject4;
    let subject5=req.body.subject5;
    let subject6=req.body.subject6;

    let marks = await rec2.findOne({studentId: String(studentId)});
    if (!marks) {
      marks = new rec2({studentId: String(studentId)});
    }
    marks.ut1.subject1 = subject1 ;
    marks.ut1.subject2 = subject2 ;
    marks.ut1.subject3 = subject3 ;
    marks.ut1.subject4 = subject4 ;
    marks.ut1.subject5 = subject5 ;
    marks.ut1.subject6 = subject6 ;

   await marks.save();

    res.status(200).json({
      success: true,
      message: 'UT1 marks saved successfully',
    
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'UT1 subject entry failed', error: error.message });
  }
};



exports.midTerm = async (req,res) => {
    try{
    let studentId=req.body.studentId;
    let subject1=req.body.subject1;
    let subject2=req.body.subject2;
    let subject3=req.body.subject3;
    let subject4=req.body.subject4;
    let subject5=req.body.subject5;
    let subject6=req.body.subject6;

    let marks = await rec2.findOne({studentId: String(studentId)});
    if (!marks) {
      marks = new rec2({studentId: String(studentId)});
    }
    marks.midTerm.subject1 = subject1;
    marks.midTerm.subject2 = subject2;
    marks.midTerm.subject3 = subject3;
    marks.midTerm.subject4 = subject4;
    marks.midTerm.subject5 = subject5;
    marks.midTerm.subject6 = subject6;

    await marks.save();

    res.status(200).json({
      success: true,
      message: 'Mid Term marks saved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Mid Term subject entry failed', error: error.message });
  }
};



exports.unittest2 = async (req,res) => {
    try{
    let studentId=req.body.studentId;
    let subject1=req.body.subject1;
    let subject2=req.body.subject2;
    let subject3=req.body.subject3;
    let subject4=req.body.subject4;
    let subject5=req.body.subject5;
    let subject6=req.body.subject6;

    let marks = await rec2.findOne({studentId: String(studentId)});
    if (!marks) {
      marks = new rec2({studentId: String(studentId)});
    }
    marks.ut2.subject1 = subject1;
    marks.ut2.subject2 = subject2;
    marks.ut2.subject3 = subject3;
    marks.ut2.subject4 = subject4;
    marks.ut2.subject5 = subject5;
    marks.ut2.subject6 = subject6;

    await marks.save();

    res.status(200).json({
      success: true,
      message: 'UT2 marks saved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'UT2 subject entry failed', error: error.message });
  }
};




exports.final = async (req,res) => {
    try{
    let studentId=req.body.studentId;
    let subject1=req.body.subject1;
    let subject2=req.body.subject2;
    let subject3=req.body.subject3;
    let subject4=req.body.subject4;
    let subject5=req.body.subject5;
    let subject6=req.body.subject6;

    let marks = await rec2.findOne({studentId: String(studentId)});
    if (!marks) {
      marks = new rec2({studentId: String(studentId)});
    }
    marks.final.subject1 = subject1;
    marks.final.subject2 = subject2;
    marks.final.subject3 = subject3;
    marks.final.subject4 = subject4;
    marks.final.subject5 = subject5;
    marks.final.subject6 = subject6;

    await marks.save();

    res.status(200).json({
      success: true,
      message: 'Final marks saved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Final subject entry failed', error: error.message });
  }
};


exports.getunittest1=async(req,res)=>
{
  try {
    const studentId = req.adm.id;
    const data = await rec2.findOne({studentId: String(studentId)});
    if (!data) {
      return res.status(200).json({success:true, msg:"No marks found", data: {}});
    }
    return res.status(200).json({success:true, msg:"unittest1 fetched successfully", marks: data.ut1, data: data.ut1});
  } catch (error) {
    return res.status(500).json({success:false, msg:"Failed to fetch UT1 marks", error: error.message});
  }
}
exports.getunittest2=async(req,res)=>
{
  try {
    const studentId = req.adm.id;
    const data = await rec2.findOne({studentId: String(studentId)});
    if (!data) {
      return res.status(200).json({success:true, msg:"No marks found", data: {}});
    }
    return res.status(200).json({success:true, msg:"unittest2 fetched successfully", data: data.ut2});
  } catch (error) {
    return res.status(500).json({success:false, msg:"Failed to fetch UT2 marks", error: error.message});
  }
}
exports.getmidTerm=async(req,res)=>
{
  try {
    const studentId = req.adm.id;
    const data = await rec2.findOne({studentId: String(studentId)});
    if (!data) {
      return res.status(200).json({success:true, msg:"No marks found", data: {}});
    }
    return res.status(200).json({success:true, msg:"midTerm fetched successfully", data: data.midTerm});
  } catch (error) {
    return res.status(500).json({success:false, msg:"Failed to fetch MidTerm marks", error: error.message});
  }
}
exports.getfinal=async(req,res)=>
{
  try {
    const studentId = req.adm.id;
    const data = await rec2.findOne({studentId: String(studentId)});
    if (!data) {
      return res.status(200).json({success:true, msg:"No marks found", data: {}});
    }
    return res.status(200).json({success:true, msg:"final fetched successfully", data: data.final});
  } catch (error) {
    return res.status(500).json({success:false, msg:"Failed to fetch Final marks", error: error.message});
  }
}
