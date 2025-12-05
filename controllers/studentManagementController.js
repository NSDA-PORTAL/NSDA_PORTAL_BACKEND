const StudentManagement = require("../models/StudentManagement");
const Attendance = require("../models/attendance.model");
const StudentTask = require("../models/StudentTask");
const User = require("../models/User");

// -----------------------------------------------------
// UPDATE STUDENT MANAGEMENT (attendance + task + blacklist)
// -----------------------------------------------------
async function updateStudentManagement(studentId) {
  const student = await User.findById(studentId);
  if (!student) return;

  // Attendance records
  const records = await Attendance.find({ userId: studentId });
  const total = records.length;
  const present = records.filter(r => r.status === "present").length;
  const absent = records.filter(r => r.status === "absent").length;
  const late = records.filter(r => r.status === "late").length;
  const rate = total ? (present / total) * 100 : 0;

  // Task records
  const tasksAssigned = await StudentTask.countDocuments({ studentId });
  const tasksSubmitted = await StudentTask.countDocuments({
    studentId,
    grade: { $ne: "not-submitted" }
  });

  const tasksGraded = await StudentTask.countDocuments({
    studentId,
    grade: { $exists: true, $ne: "not-submitted" }
  });

  const completionRate = tasksAssigned ? (tasksSubmitted / tasksAssigned) * 100 : 0;

  // Update StudentManagement record
  await StudentManagement.findOneAndUpdate(
    { studentId },
    {
      studentId,
      name: student.name,
      email: student.email,
      track: student.track,

      attendance: {
        total,
        present,
        absent,
        late,
        rate
      },

      tasks: {
        totalAssigned: tasksAssigned,
        submitted: tasksSubmitted,
        graded: tasksGraded,
        completionRate
      },

      // Sync blacklist status
      isBlacklisted: student.isBlacklisted
    },
    { upsert: true, new: true }
  );
}

// -----------------------------------------------------
// BLACKLIST STUDENT
// -----------------------------------------------------
const blacklistStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.isBlacklisted = true;
    await student.save();

    await updateStudentManagement(studentId);

    res.json({ message: `${student.name} has been blacklisted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// UN-BLACKLIST STUDENT
// -----------------------------------------------------
const unblacklistStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.isBlacklisted = false;
    await student.save();

    await updateStudentManagement(studentId);

    res.json({ message: `${student.name} removed from blacklist` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET ALL STUDENTS MANAGEMENT DATA
// -----------------------------------------------------
const getAllStudentManagement = async (req, res) => {
  try {
    const data = await StudentManagement.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET SINGLE STUDENT MANAGEMENT
// -----------------------------------------------------
const getOneStudentManagement = async (req, res) => {
  try {
    const { studentId } = req.params;
    const data = await StudentManagement.findOne({ studentId });

    if (!data) return res.status(404).json({ message: "Not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// EXPORT ALL CONTROLLERS
module.exports = {
  updateStudentManagement,
  blacklistStudent,
  unblacklistStudent,
  getAllStudentManagement,
  getOneStudentManagement
};
