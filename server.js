const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const resourceRoutes = require("./routes/resourceRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const studentManagementRoutes = require("./routes/studentManagementRoutes");
const attendanceRoutes = require("./routes/attendance.routes.js");
const taskRoutes = require("./routes/taskRoutes.js");

require("dotenv").config();

const app = express();
// Security middlewares
app.use(helmet());  // secure headers
app.use(cors());    // allow frontend access
app.use(express.json()); // parse JSON safely

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/resources", resourceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/studentManagement", studentManagementRoutes);


// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
