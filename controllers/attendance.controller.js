const Attendance = require('../models/attendance.model');
const mongoose = require('mongoose');

// Helper to get YYYY-MM-DD
const todayString = (d = new Date()) => d.toISOString().split('T')[0];

// Mark attendance
// If admin passes `userId` in body, allow marking for that user (admin only uses checkRole)
exports.markAttendance = async (req, res, next) => {
  try {
    // support admin marking for someone else: body.userId
    const targetUserId = req.body.userId && req.user.role === 'admin' ? req.body.userId : req.user.id;
    const suppliedStatus = req.body.status; // optional: 'present'|'absent'|'late'
    const date = req.body.date ? req.body.date : todayString();

    // Only allow statuses defined in schema
    const allowed = ['present', 'absent', 'late'];
    const status = (suppliedStatus && allowed.includes(suppliedStatus)) ? suppliedStatus : 'present';

    // Create or fail if duplicate (unique index will enforce)
    const doc = new Attendance({ userId: targetUserId, date, status });

    await doc.save();

    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: doc
    });
  } catch (err) {
    // if unique index duplicated: send friendly error
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this date' });
    }
    next(err);
  }
};

// Get attendance history for logged-in user
exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const records = await Attendance.find({ userId }).sort({ date: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// Weekly summary — last 7 days from now (by createdAt/time)
exports.getWeeklySummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const last7 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const records = await Attendance.find({
      userId,
      // using timestamps: createdAt >= last7
      createdAt: { $gte: last7 }
    });

    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length
    };

    res.json({ success: true, summary, data: records });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all attendance (with user info if User model exists)
exports.adminGetAllAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find()
      .populate('userId', 'name email role') // leaves null fields if User model not present
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// Admin: Update an attendance record (e.g., change status to late/absent)
exports.adminUpdateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const { status } = req.body;
    const allowed = ['present', 'absent', 'late'];
    if (!status || !allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const updated = await Attendance.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Attendance record not found' });

    res.json({ success: true, message: 'Attendance updated', data: updated });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete an attendance record
exports.adminDeleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Attendance record not found' });

    res.json({ success: true, message: 'Attendance record deleted' });
  } catch (err) {
    next(err);
  }
};
