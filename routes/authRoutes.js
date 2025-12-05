const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  blacklistUser,
  unblacklistUser,
  getAllUsers
} = require("../controllers/authController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", auth, role("superadmin", "admin"), getAllUsers);
router.put("/blacklist/:userId", auth, role("superadmin", "admin"), blacklistUser);
router.put("/unblacklist/:userId", auth, role("superadmin", "admin"), unblacklistUser);

router.post("/refresh", refreshToken);


module.exports = router;