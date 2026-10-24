const mongoose= require('mongoose');

const feeSchema = new mongoose.Schema({
    StudentId:{type:String},
    StudentName:{type:String},
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },

        date: { type: Date, default: Date.now },
        amountPaid: { type: Number, required: true }

}, { timestamps: true });


module.exports = mongoose.model('FeeHostel', feeSchema);