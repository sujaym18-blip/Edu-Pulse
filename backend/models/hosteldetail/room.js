const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    singleRooms: { type: Number, default: 0 },
    doubleRooms: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);

