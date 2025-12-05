const mongoose = require("mongoose");

const studentManagementSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  track: { type: String }, // e.g., "AI", "Web Dev", etc.

  // Derived attendance data
  attendance: {
    total: { type: Number, default: 0 },
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    rate: { type: Number, default: 0 } // percentage
  },

  // Derived task data
  tasks: {
    totalAssigned: { type: Number, default: 0 },
    submitted: { type: Number, default: 0 },
    graded: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 } // percentage
  },
  isBlacklisted: {
    type: Boolean,
    default: false,
},


}, { timestamps: true });

module.exports = mongoose.model("StudentManagement", studentManagementSchema);
