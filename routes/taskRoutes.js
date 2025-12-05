// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// --- CRITICAL FIX: IMPORT REAL MIDDLEWARE ---
const auth = require("../middleware/authMiddleware"); // Import actual JWT verification
const role = require("../middleware/roleMiddleware"); // Import actual role check
// ---------------------------------------------


const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getSubmissionsForTask,
  gradeSubmission,
  getSubmissionDetails,
  submitTask,
  getTasksAll,
  getTasksTodo,
  getTasksSubmitted,
  getTasksGraded,
} = taskController;


// ================== ADMIN ROUTES (e.g., /api/tasks) ==================
// The path to role is used as a function: role("superadmin", "admin")

// CRUD
router.post("/", auth, role("superadmin", "admin"), createTask);
router.get("/", auth, role("superadmin", "admin"), getTasks);
router.put("/:taskId", auth, role("superadmin", "admin"), updateTask);
router.delete("/:taskId", auth, role("superadmin", "admin"), deleteTask);

// Submission Review and Grading
router.get("/:taskId/submissions", auth, role("superadmin", "admin"), getSubmissionsForTask);
// Admin gets submission details of a specific student for a task
router.get("/:taskId/submission/admin/:studentId", auth, role("superadmin", "admin"), getSubmissionDetails);
router.post("/:taskId/grade/:studentId", auth, role("superadmin", "admin"), gradeSubmission);


// ================== STUDENT ROUTES (e.g., /api/tasks) ==================
// Student Task List (for the ALL/TO DO/SUBMITTED/GRADED tabs)
// These are the routes returning 403, correctly guarded by auth and role('student')
router.get("/student/all", auth, role("student"), getTasksAll);
router.get("/student/todo", auth, role("student"), getTasksTodo);
router.get("/student/submitted", auth, role("student"), getTasksSubmitted);
router.get("/student/graded", auth, role("student"), getTasksGraded);

// Submission
router.post("/:taskId/submit", auth, role("student"), submitTask);
// Student views their own submission details for a task
router.get("/:taskId/submission/student", auth, role("student"), getSubmissionDetails);


module.exports = router;