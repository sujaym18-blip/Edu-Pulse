let adminmodel=require("../models/admin");
const jwt = require("jsonwebtoken");

async function auth(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return res.status(503).json({
      success: false,
      msg: "Admin authentication is not configured. Set JWT_SECRET to at least 32 characters.",
    });
  }

  const token = req.cookies?.emtoken;
  if (!token) {
    return res.status(401).json({ success: false, msg: "Please login first" });
  }

  try {
    const data = jwt.verify(token, secret, { algorithms: ["HS256"] });
    if (data.role !== "admin" || typeof data.token !== "string") {
      return res.status(403).json({ success: false, msg: "Admin access required" });
    }

    const admin = await adminmodel.findOne({ email: data.token });
    if (!admin) {
      return res.status(401).json({ success: false, msg: "Admin account not found" });
    }

    req.admin = admin;
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError || err instanceof jwt.NotBeforeError) {
      res.clearCookie("emtoken", { path: "/" });
      return res.status(401).json({ success: false, msg: "Admin session is invalid or expired. Please login again." });
    }

    console.error("Admin authentication error:", err);
    return res.status(500).json({ success: false, msg: "Unable to authenticate admin" });
  }
}

module.exports = auth;
