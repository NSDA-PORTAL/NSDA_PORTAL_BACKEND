const express = require("express");
const router = express.Router();
const {
    getResources,
    createResource,
    deleteResource,
} = require("../controllers/resourceController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, getResources);
router.post("/", auth, role("admin", "superadmin"), createResource);
router.delete("/:id", auth, role("admin", "superadmin"), deleteResource);

module.exports = router;