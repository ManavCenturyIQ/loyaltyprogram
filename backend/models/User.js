const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  passkitId: String,
  isAdmin: { type: Boolean, default: false },
  scansRemaining: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  secondaryPoints: { type: Number, default: 0 },
  tierPoints: { type: Number, default: 0 },
  tierId: String, 
  tierName: String,
  mobile: String,
  firstname: String,
  lastname: String,
  scansCount: { type: Number, default: 0 },
  programId: String,
  updatedAt: { type: Date, default: Date.now },
},
{
  timestamps : true
}
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token method
userSchema.methods.generateToken = function() {
  const jwt = require('jsonwebtoken');
  let role = 'user';
  if(this.isAdmin) role = 'admin';
  return jwt.sign({ id: this._id, email: this.email, isMerchant: this.isMerchant, isAdmin: this.isAdmin, role: role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = mongoose.model('User', userSchema);
