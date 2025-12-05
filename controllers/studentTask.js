const Task = require("../models/Task");
const StudentTask = require("../models/StudentTask");

// STUDENT: Submit task
const submitTask = async (req, res) => {
  try {
    const { submissionText } = req.body;

    const submission = await StudentTask.findOneAndUpdate(
      {
        studentId: req.user._id,
        taskId: req.params.taskId,
      },
      {
        submissionText,
        submittedAt: new Date(),
        grade: "pending"
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// STUDENT: To-Do tasks (not submitted yet)
const getTodoTasks = async (req, res) => {
  try {
    const all = await Task.find();
    const submitted = await StudentTask.find({ studentId: req.user._id }).distinct("taskId");

    const todo = all.filter(t => !submitted.includes(t._id.toString()));

    res.json({ success: true, todo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// STUDENT: Submitted tasks
const getSubmittedTasks = async (req, res) => {
  try {
    const submitted = await StudentTask.find({ studentId: req.user._id })
      .populate("taskId");

    res.json({ success: true, submitted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// STUDENT: Graded tasks
const getGradedTasks = async (req, res) => {
  try {
    const graded = await StudentTask.find({
      studentId: req.user._id,
      grade: { $ne: "not-submitted" }
    }).populate("taskId");

    res.json({ success: true, graded });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  submitTask,
  getTodoTasks,
  getSubmittedTasks,
  getGradedTasks
};