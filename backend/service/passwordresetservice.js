const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000;
const GENERIC_SUCCESS_MESSAGE = 'If an account exists for that email, a password reset link will be sent.';

const createMailer = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  const port = Number(SMTP_PORT);

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !Number.isInteger(port) || port < 1) {
    const error = new Error('Password recovery email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.');
    error.statusCode = 503;
    throw error;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const getResetUrl = (role, token) => {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const url = new URL('/ResetPassword', frontendUrl);
  url.searchParams.set('role', role);
  url.searchParams.set('token', token);
  return url.toString();
};

exports.requestPasswordReset = async (req, res, UserModel, role) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, msg: 'Enter a valid email address.' });
  }

  try {
    const mailer = createMailer();
    const user = await UserModel.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (!user) {
      return res.status(200).json({ success: true, msg: GENERIC_SUCCESS_MESSAGE });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_LIFETIME_MS);
    await user.save();

    try {
      const resetUrl = getResetUrl(role, token);
      await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Reset your EduPulse password',
        text: `Use this link to reset your password. It expires in one hour: ${resetUrl}`,
        html: `<p>We received a request to reset your EduPulse password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`,
      });
    } catch (error) {
      user.resetPasswordTokenHash = undefined;
      user.resetPasswordExpiresAt = undefined;
      await user.save();
      throw error;
    }

    return res.status(200).json({ success: true, msg: GENERIC_SUCCESS_MESSAGE });
  } catch (error) {
    console.error(`Password reset email error (${role}):`, error);
    return res.status(error.statusCode || 503).json({
      success: false,
      msg: error.statusCode === 503 ? error.message : 'Unable to send a password reset email right now. Please try again later.',
    });
  }
};

exports.resetPassword = async (req, res, UserModel) => {
  const { token, password } = req.body;
  if (typeof token !== 'string' || !token || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      success: false,
      msg: 'A valid reset link and a password of at least 8 characters are required.',
    });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserModel.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select('+resetPasswordTokenHash +resetPasswordExpiresAt');

    if (!user) {
      return res.status(400).json({ success: false, msg: 'This password reset link is invalid or has expired.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ success: true, msg: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ success: false, msg: 'Unable to reset the password right now. Please try again.' });
  }
};
