const mongoose = require("mongoose");

// models/StudentTask.js (The core model for submissions/grades)
const studentTaskSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },

    submissionLink: { type: String }, // e.g., https://github.com/my-project (Matches 'Submit' modal)
    submissionNotes: { type: String }, // Matches 'Notes for Mentor' in 'Submit' modal
    submittedAt: { type: Date },

    // Status is essential for the ALL/TO DO/SUBMITTED/GRADED tabs
    status: {
      type: String,
      enum: ["pending-review", "graded", "not-submitted"],
      default: "not-submitted",
    },

    finalGrade: { type: String }, // e.g., "A", "95%", "Excellent"
    adminFeedback: { type: String } // Matches 'Mentor Grade & Feedback'
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.StudentTask || mongoose.model("StudentTask", studentTaskSchema);