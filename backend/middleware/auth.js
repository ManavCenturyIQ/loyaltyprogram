// middleware/auth.js
const jwt = require("jsonwebtoken");
const Merchant = require("../models/Merchant");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const merchant = await Merchant.findById(decoded.id).select("-password");
    const user = await User.findById(decoded.id).select("-password");
    if (!merchant && !user) return res.status(401).json({ message: "Merchant/User not found" });

    if (user) req.user = user;
    if (merchant) req.user = merchant;
    
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

const admin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { auth, admin };
