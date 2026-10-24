const mongoose = require('mongoose');

const marks = new mongoose.Schema({
  studentId:{type:String},
  ut1: {
    subject1: { type: Number, default: 0 },
    subject2: { type: Number, default: 0 },
    subject3: { type: Number, default: 0 },
    subject4: { type: Number, default: 0 },
    subject5: { type: Number, default: 0 },
    subject6: { type: Number, default: 0 }
  },
  ut2: {
    subject1: { type: Number, default: 0 },
    subject2: { type: Number, default: 0 },
    subject3: { type: Number, default: 0 },
    subject4: { type: Number, default: 0 },
    subject5: { type: Number, default: 0 },
    subject6: { type: Number, default: 0 }
  },
  midTerm: {
    subject1: { type: Number, default: 0 },
    subject2: { type: Number, default: 0 },
    subject3: { type: Number, default: 0 },
    subject4: { type: Number, default: 0 },
    subject5: { type: Number, default: 0 },
    subject6: { type: Number, default: 0 }
  },
  final: {
    subject1: { type: Number, default: 0 },
    subject2: { type: Number, default: 0 },
    subject3: { type: Number, default: 0 },
    subject4: { type: Number, default: 0 },
    subject5: { type: Number, default: 0 },
    subject6: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Marks', marks);
