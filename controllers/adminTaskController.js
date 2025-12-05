import Task from "../models/Task.js";
import StudentTask from "../models/StudentTask.js";

// CREATE task (admin)
export const createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET all tasks (admin)
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE task (admin)
export const updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE task (admin)
export const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GRADE student submission (admin)
export const gradeSubmission = async (req, res) => {
  try {
    const { grade, adminFeedback } = req.body;

    const graded = await StudentTask.findByIdAndUpdate(
      req.params.submissionId,
      { grade, adminFeedback },
      { new: true }
    );

    res.json({ success: true, graded });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};