const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  blacklistStudent,
  unblacklistStudent,
  getAllStudentManagement,
  getOneStudentManagement
} = require("../controllers/studentManagementController");

router.get("/", auth, role("admin", "superadmin"), getAllStudentManagement);
router.get("/:studentId", auth, getOneStudentManagement);

router.put("/blacklist/:studentId", auth, role("admin", "superadmin"), blacklistStudent);
router.put("/unblacklist/:studentId", auth, role("admin", "superadmin"), unblacklistStudent);

module.exports = router;
