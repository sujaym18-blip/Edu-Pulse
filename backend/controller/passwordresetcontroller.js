const Admin = require('../models/admin');
const Staff = require('../models/staff');
const Student = require('../models/admission');
const { requestPasswordReset, resetPassword } = require('../service/passwordresetservice');

exports.requestAdminPasswordReset = (req, res) => requestPasswordReset(req, res, Admin, 'admin');
exports.resetAdminPassword = (req, res) => resetPassword(req, res, Admin);
exports.requestStaffPasswordReset = (req, res) => requestPasswordReset(req, res, Staff, 'staff');
exports.resetStaffPassword = (req, res) => resetPassword(req, res, Staff);
exports.requestStudentPasswordReset = (req, res) => requestPasswordReset(req, res, Student, 'student');
exports.resetStudentPassword = (req, res) => resetPassword(req, res, Student);
