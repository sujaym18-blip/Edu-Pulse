const mongo = require('mongoose');

const studentTransportSchema = new mongo.Schema({
  studentId:{
    type:String,
    required:true,
  },
  studentName: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String, 
    required: true,
  },
  Route: {
    type: String, 
    required: true,
  },
  Stop: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String, 
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },


});

module.exports = mongo.model('StudentTransport', studentTransportSchema);
