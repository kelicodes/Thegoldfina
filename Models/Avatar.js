// models/Avatar.js
const mongoose = require('mongoose');

const AvatarSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true }, // URL from Cloudinary
  height: { type: Number },  // optional
  weight: { type: Number },  // optional
  bodyShape: { type: String }, // optional: 'apple', 'pear', etc.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Avatar', AvatarSchema);
