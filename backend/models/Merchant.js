const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const merchantSchema = new mongoose.Schema({
  tierName: { type: String, required: true },
  tierId: { type: String, unique: true, required: true },
  scansCount: { type: Number, default: 0 },
  registrationCount: { type: Number, default: 0 },
  email: { type: String, unique: true },
  password: String,
  updatedAt: { type: Date, default: Date.now },
  
},
{
  timestamps : true
});

merchantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
merchantSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token method
merchantSchema.methods.generateToken = function() {
  const jwt = require('jsonwebtoken');
  let role = 'merchant';
  return jwt.sign({ id: this._id, email: this.email, tierName: this.tierName, tierId: this.tierId, scansCount: this.scansCount, role: role, qrCode:this.qrCode}, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = mongoose.model('Merchant', merchantSchema);

