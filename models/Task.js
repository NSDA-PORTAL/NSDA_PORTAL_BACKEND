// models/Task.js
const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    supportingResources: [{ // Matches the resources links in the student/admin views
      title: String,
      link: String
    }],
    deadline: { type: Date, required: true },
    estTime: { type: Number }, // Estimated Time
  },
  { timestamps: true }
);
module.exports =
  mongoose.models.Task || mongoose.model("Task", taskSchema);