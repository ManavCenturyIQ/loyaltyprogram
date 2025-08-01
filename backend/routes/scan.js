// routes/scan.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/User");
const Merchant = require("../models/Merchant");
const QRCode = require("qrcode");
const { auth, admin } = require("../middleware/auth");
const COOLDOWN_MS = 60 * 1000; // 1 minute (change to 24 * 60 * 60 * 1000 for 1 day)

// User registration
router.post("/register", async (req, res) => {
  try {
    const { tierName, email, password, tierId } = req.body;
    const merchant = new Merchant({ tierName, email, password, tierId });
    await merchant.save();
    const token = merchant.generateToken();
    res.status(201).json({ token, merchant });
  } catch (error) {
    if (error.code === 11000) {
      console.log("Duplicate key error:", error.keyValue);
      const duplicatedField = Object.keys(error.keyPattern)[0];
      return res
        .status(400)
        .json({ message: `${duplicatedField} already exists` });
    }

    return res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
});

router.post("/register-user", async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    console.log(isAdmin);
    const user = new User({ name, email, password });
    await user.save();
    const token = user.generateToken();
    res.status(201).json({ token, user });
  } catch (error) {
    if (error.code === 11000) {
      console.log("Duplicate key error:", error.keyValue);
      const duplicatedField = Object.keys(error.keyPattern)[0];
      return res
        .status(400)
        .json({ message: `${duplicatedField} already exists` });
    }

    return res
      .status(400)
      .json({ message: "Registration failed", error: error.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const merchant = await Merchant.findOne({ email });
    const user = await User.findOne({ email });

    if (!merchant && !user) {
      return res.status(401).json({ message: "User not found" });
    }
    let valid = "";
    let token = "";
    if (merchant) {
      valid = await merchant.comparePassword(password);
      token = merchant.generateToken();
    }

    if (user) {
      valid = await user.comparePassword(password);
      token = user.generateToken();
    }
    console.log(token);
    console.log(valid);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user) {
      res.json({ token, user });
    }
    if (merchant) {
      res.json({ token, merchant });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed", error });
  }
});

router.post("/users", async (req, res) => {
  try {
    const data = req.body;
    const xPasskitSignature = req.header("x-passkit-signature");
    const externalId = data.pass.recordData["members.member.externalId"];
    const points = data.pass.recordData["members.member.points"];
    const secondaryPoints =
      data.pass.recordData["members.member.secondaryPoints"];
    const status = data.pass.recordData["members.member.status"];
    const tierPoints = data.pass.recordData["members.member.tierPoints"];
    const tierId = data.pass.recordData["members.tier.id"];
    const tierName = data.pass.recordData["members.tier.name"];
    const name = data.pass.recordData["person.displayName"];
    const email = data.pass.recordData["person.emailAddress"];
    const mobile = data.pass.recordData["person.mobileNumber"];
    const passUrl = data.pass.passUrl;
    const passkitId = data.pass.id;
    const programId = data.pass.recordData["members.program.id"];
    const user = new User({
      name,
      email,
      mobile,
      passkitId,
      tierPoints,
      points,
      secondaryPoints,
      tierId,
      tierName,
      programId,
    });
    await user.save();
    const token = user.generateToken();
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: "Registration failed", error });
  }
});

router.get("/merchant/:id/details", auth, async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant)
      return res.status(404).json({ message: "Merchant not found" });

    const users = await User.find({ tierId: merchant.tierId });

    res.json({ merchant, users });
  } catch (error) {
    console.error("Merchant info error:", error);
    res.status(500).json({ message: "Failed to load merchant details" });
  }
});

router.get("/merchant/:tierId/users", auth, async (req, res) => {
  try {
    const { tierId } = req.params;
    const users = await User.find({ tierId }).select("-password"); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err });
  }
});
//NEW
let timer = 30000;

// POST /merchant/scan/:merchantSlug
router.post("/merchant/scan/:merchantSlug", auth, async (req, res) => {
  const merchantSlug = req.params.merchantSlug;
  const { passkitId } = req.body;

  if (!merchantSlug || !passkitId) {
    return res
      .status(400)
      .json({ message: "Missing merchant slug or user PassKit ID" });
  }

  try {
    const merchant = await Merchant.findOne({ _id: merchantSlug });
    if (!merchant) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    const user = await User.findOne({ passkitId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user.email);

    // Cooldown check
    const now = new Date();
    if (user.updatedAt && now - new Date(user.updatedAt) < COOLDOWN_MS) {
      const secondsLeft = Math.ceil(
        (COOLDOWN_MS - (now - user.updatedAt)) / 1000
      );
      console.log(secondsLeft);
      return res.status(429).json({
        message: `Please wait ${secondsLeft} more seconds before scanning again.`,
      });
    }

    // Atomically update counts in database
    await Promise.all([
      User.updateOne(
        { _id: user._id },
        {
          $inc: { scansCount: 1, tierPoints: 1, points: 1 },
          $set: { updatedAt: now },
        }
      ),
      Merchant.updateOne({ _id: merchant._id }, { $inc: { scansCount: 1 } }),
    ]);

    // Send updated points to Passkit (only sending, never receiving counts)
    await updateMemberTierPoints(user.points + 1, user);

    return res.json({
      message: "Scan successful",
    });
  } catch (error) {
    console.error("Scan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//end

// POST /admin/merchant - Create new merchant
router.post("/admin/merchant", auth, admin, async (req, res) => {
  try {
    const { tierName, email, password, tierId, qrCode } = req.body;
    console.log(req.body);
    const merchant = new Merchant({
      tierName,
      email,
      password,
      tierId,
      qrCode,
    });
    await merchant.save();

    res.status(201).json({ message: "Merchant created", merchant });
  } catch (error) {
    if (error.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern)[0];
      return res
        .status(400)
        .json({ message: `${duplicatedField} already exists` });
    }
    res
      .status(400)
      .json({ message: "Failed to create merchant", error: error.message });
  }
});

async function updateMemberTierPoints(newPoints, user) {
  try {
    const payload = {
      id: user.passkitId,
      externalId: user.email,
      points: newPoints,
      tierId: user.tierId,
      programId: user.programId,
    };
    const response = await axios.put(
      "https://api.pub1.passkit.io/members/member/points/set",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PASSKIT_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Member tierPoints updated:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to update member tierPoints:",
      error.response?.data || error.message
    );
    throw error;
  }
}

router.get("/admin/stats", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Hide sensitive fields
    const merchants = await Merchant.find().select("-password");
    res.json({ users, merchants });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

module.exports = router;
