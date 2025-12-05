const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceHistory,
  getWeeklySummary,
  adminGetAllAttendance,
  adminUpdateAttendance,
  adminDeleteAttendance
} = require('../controllers/attendance.controller');

const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post('/mark', auth, markAttendance);
router.get('/history', auth, getAttendanceHistory);

router.get('/summary/weekly', auth, getWeeklySummary);
router.get('/admin/all', auth, checkRole('admin'), adminGetAllAttendance);

router.patch('/admin/:id', auth, checkRole('admin'), adminUpdateAttendance);
router.delete('/admin/:id', auth, checkRole('admin'), adminDeleteAttendance);

module.exports = router;
