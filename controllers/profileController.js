const Profile = require("../models/Profile");
const User = require("../models/User");


exports.getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id })
      .populate("user", "name email track role");

    // Auto-create profile if missing
    if (!profile) {
      profile = await Profile.create({ user: req.user.id });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    // If no profile found, create one
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }

    // Allowed fields (prevents updating unwanted data)
    const allowedFields = ["phone", "school", "address", "bio", "track"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
