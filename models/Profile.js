const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phone: {
    type: String,
    default: "" // optional, can be empty
  },
  school: {
    type: String,
    default: "" // optional, can be empty
  },
  address: {
    type: String,
    default: "" // optional, can be empty
  },
  bio: {
    type: String,
    default: "" // optional, can be empty
  },
}, {
  timestamps: true
});

module.exports =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);