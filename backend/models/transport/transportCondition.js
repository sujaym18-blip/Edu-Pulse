const mongo = require('mongoose');

const transportcondition = new mongo.Schema({
  busNo: {
    type: String,
    required: true,
    unique: true,
  },

  size: {
    type: String, 
    required: true,
  },
  fuelCapacity: {
    type: Number, 
    required: true,
  },
  currentFuel: {
    type: Number, 
    required: true,
  },
  routeNo: {
    type: String, 
    required: true,
  },
  busType: {
    type: String,
    required: true,
  },
  mileage: {
    type: Number, 
    default: 0,
  },
  lastRefuelDate: {
    type: Date,
    required: true,
  },
  lastMaintenanceDate: {
    type: Date,
    required: true,
  },

  status: {
    type: String,
    enum: ['active', 'under maintenance', 'off-duty'],
    default: 'active',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongo.model('transportcondition', transportcondition);
