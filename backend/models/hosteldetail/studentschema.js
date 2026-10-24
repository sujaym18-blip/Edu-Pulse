const mongoose = require('mongoose');

const studentSchem= new mongoose.Schema({
    studentid: { type: String, required: true },
    Name: { type: String, required: true },
    address:{type:String,required:true},
    contactNumber: { type: String },
    email: { type: String },
    dob: { type: Date },
    bloodGroup: { type: String },
    allergies: { type: String },
    emergencyContact: { type: String },
    gender: { type: String, enum: ['male', 'female'], required: true },
    roomType: { type: String, enum: ['single', 'double'], required: true },
    ac: { type: Boolean, default: false },
    cooler: { type: Boolean, default: false },
    fan: { type: Boolean, default: true },
    personalKitchen: { type: Boolean, default: false },
    attachedBathroom: { type: Boolean, default: false },
    balcony: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    totalCharge: { type: Number, required: true },  
    roomNo:{type:String,required:true},

}, { timestamps: true });

module.exports = mongoose.model('StudentSchem', studentSchem);


