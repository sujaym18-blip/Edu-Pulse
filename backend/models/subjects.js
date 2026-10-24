const mongoose = require('mongoose');
const subject = new mongoose.Schema({

  branch: {type:String, required:true},
  departmentId: {type:String},
  departmentName: {type:String},
  departmentRef: {type:String},
  subject1: { type: String, required: true },
  subject2: { type: String, required: true },
  subject3: { type: String, required: true },
  subject4: { type: String, required: true },
  subject5: { type: String, required: true },
  subject6: { type: String, required: true },
  
});

module.exports = mongoose.model('Subject', subject);
