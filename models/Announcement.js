const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },

    // UPDATED category field
    category: {
      type: String,
      enum: ["urgent", "info", "warning", "normal"],
      default: "normal",
      trim: true,
    },

  },
  {
    timestamps: true,
  }
);

module.exports = 
  mongoose.models.Announcement ||
  mongoose.model("Announcement", AnnouncementSchema);