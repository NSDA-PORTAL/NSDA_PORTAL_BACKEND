// controllers/taskController.js
const Task = require("../models/Task");
const StudentTask = require("../models/StudentTask");
const User = require("../models/User"); // Using your actual User model

// ================== ADMIN CONTROLLERS ==================

// Helper to assign the task to all active students in the system
const assignTaskToAllStudents = async (taskId) => {
    const students = await User.find({ role: 'student', isBlacklisted: false });
    const studentTaskEntries = students.map(student => ({
        taskId: taskId,
        studentId: student._id
    }));
    // Bulk create only if entry doesn't exist (useful if running multiple times)
    await StudentTask.insertMany(studentTaskEntries, { ordered: false }).catch(err => { /* ignore duplicate key errors */ });
};

// CREATE TASK
const createTask = async (req, res) => {
  try {
    const { title, description, deadline, estTime, supportingResources } = req.body;
    const task = await Task.create({ title, description, deadline, estTime, supportingResources });

    // Auto-assign task to all students upon creation
    await assignTaskToAllStudents(task._id);

    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET ALL TASKS (For Admin Task & Resources view)
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ deadline: 1 });
    const totalStudents = await User.countDocuments({ role: 'student', isBlacklisted: false });

    // Aggregate submission data
    const submissionData = await StudentTask.aggregate([
        { $match: { submissionLink: { $ne: null } } }, // Only count actual submissions
        { $group: { 
            _id: "$taskId", 
            submittedCount: { $sum: 1 }, 
            pendingReviews: { $sum: { $cond: [{ $eq: ["$status", "pending-review"] }, 1, 0] } } 
        } }
    ]);

    const tasksWithCounts = tasks.map(task => {
        const data = submissionData.find(d => d._id.equals(task._id)) || { submittedCount: 0, pendingReviews: 0 };
        return {
            ...task.toObject(),
            totalStudents,
            // Displays: '15/20 Submissions'
            submissionStats: `${data.submittedCount}/${totalStudents} Submissions`, 
            pendingReviewCount: data.pendingReviews
        };
    });

    res.json({ success: true, tasks: tasksWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET SUBMISSIONS FOR A SPECIFIC TASK (For Admin Submissions Review view)
const getSubmissionsForTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });

        const submissions = await StudentTask.find({ taskId, submissionLink: { $ne: null } })
            .populate('studentId', 'name')
            .sort({ submittedAt: -1 });

        const totalPending = submissions.filter(s => s.status === 'pending-review').length;
        
        const formattedSubmissions = submissions.map(sub => ({
            studentName: sub.studentId.name,
            studentId: sub.studentId._id,
            submittedAt: sub.submittedAt,
            grade: sub.finalGrade,
            status: sub.status
        }));

        res.json({
            success: true,
            taskTitle: task.title,
            totalPending,
            submissions: formattedSubmissions
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET SINGLE SUBMISSION DETAILS (Used by both Admin and Student 'View Submission')
const getSubmissionDetails = async (req, res) => {
    try {
        const { taskId } = req.params;
        // Student ID comes from the authenticated user or an admin parameter
        const studentId = req.params.studentId || req.user._id;
        const submission = await StudentTask.findOne({ studentId, taskId })
            .populate('studentId', 'name')
            .populate('taskId', 'title');
        
        if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
        
        res.json({
            success: true,
            submissionDetails: {
                studentName: submission.studentId.name,
                taskTitle: submission.taskId.title,
                submittedLink: submission.submissionLink,
                studentNotes: submission.submissionNotes,
                finalGrade: submission.finalGrade,
                adminFeedback: submission.adminFeedback,
                status: submission.status
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GRADE STUDENT SUBMISSION
const gradeSubmission = async (req, res) => {
  try {
    const { finalGrade, adminFeedback } = req.body;
    const { studentId, taskId } = req.params;

    const studentTask = await StudentTask.findOneAndUpdate(
      { studentId: studentId, taskId: taskId },
      { finalGrade, adminFeedback, status: "graded" },
      { new: true }
    );

    if (!studentTask) return res.status(404).json({ success: false, message: "Submission not found" });

    res.json({ success: true, studentTask });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Utility CRUD operations
const updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, task });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
const deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        await StudentTask.deleteMany({ taskId: req.params.id });
        res.json({ success: true, message: "Task and associated submissions deleted" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


// ================== STUDENT CONTROLLERS ==================

// SUBMIT TASK (Matches 'Submit: Informative Speech Outline' modal)
const submitTask = async (req, res) => {
  try {
    const studentId = req.user._id; 
    const { submissionLink, submissionNotes } = req.body;
    
    // Find the task entry for the student
    const submission = await StudentTask.findOneAndUpdate(
      { studentId: studentId, taskId: req.params.taskId },
      { submissionLink, submissionNotes, submittedAt: new Date(), status: "pending-review" },
      { new: true }
    );

    if (!submission) return res.status(404).json({ success: false, message: "Task not found or not assigned" });

    res.json({ success: true, submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get tasks filtered by status for student tabs
const getFilteredStudentTasks = async (req, res, filter = 'all') => {
    try {
        const studentId = req.user._id; 
        let query = { studentId };

        if (filter === 'todo') {
            query.status = 'not-submitted';
        } else if (filter === 'submitted') {
            query.status = 'pending-review';
        } else if (filter === 'graded') {
            query.status = 'graded';
        }

        const studentTasks = await StudentTask.find(query)
                                               .populate({ 
                                                   path: "taskId",
                                                   select: "title description deadline supportingResources createdAt"
                                                })
                                               .sort({ 'taskId.deadline': 1 }); // Sort by task deadline
                                               const tasks = studentTasks.map(st => ({
            taskId: st.taskId._id,
            title: st.taskId.title,
            description: st.taskId.description,
            deadline: st.taskId.deadline,
            createdAt: st.taskId.createdAt,
            supportingResources: st.taskId.supportingResources || [],
            submissionStatus: st.status, 
            finalGrade: st.finalGrade,
            // Include StudentTask ID for easy reference if needed
            studentTaskId: st._id
        }));

        res.json({ success: true, tasks });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getTasksAll = (req, res) => getFilteredStudentTasks(req, res, 'all');
const getTasksTodo = (req, res) => getFilteredStudentTasks(req, res, 'todo');
const getTasksSubmitted = (req, res) => getFilteredStudentTasks(req, res, 'submitted');
const getTasksGraded = (req, res) => getFilteredStudentTasks(req, res, 'graded');


module.exports = {
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
};