const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["superadmin", "admin", "student"],
    default: "student"
  },

  track: {
    type: String,
    enum: ["Web Dev", "UI/UX", "Data Science"], // allowed tracks
    default: "Web Dev" // default track if not specified
  },

  isBlacklisted: {
    type: Boolean,
    default: false
  },

  refreshToken: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
