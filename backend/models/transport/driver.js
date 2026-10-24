const mongo = require('mongoose');


const driverSchema = new mongo.Schema({
  driverId: {type: String,required: true,unique: true,},

  Route:{type: String,required: true,},

  name: {type: String,required: true,},

  licenseNumber: {type: String,required: true,unique: true, },

  phoneNumber: {type: String,required: true,},

  email: {type: String,required: true,unique: true},

  dateOfBirth: {type: Date,required: true },

  address: {type: String,required: true},

  employmentStartDate: {type: Date,required: true},

  lastUpdated: {type: Date,default: Date.now},
});

module.exports = mongo.model('Driver', driverSchema);