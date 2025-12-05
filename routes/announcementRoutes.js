const express = require("express");
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Student: view all announcements (any authenticated user)
router.get("/", auth, getAnnouncements);

// Admin/Superadmin: CRUD
router.post("/", auth, role("superadmin", "admin"), createAnnouncement);
router.put("/:id", auth, role("superadmin", "admin"), updateAnnouncement);
router.delete("/:id", auth, role("superadmin", "admin"), deleteAnnouncement);

module.exports = router;
