const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/profileController");

// Get own profile
router.get("/me", auth, getProfile);

// Update own profile
router.put("/me", auth, updateProfile);

module.exports = router;
