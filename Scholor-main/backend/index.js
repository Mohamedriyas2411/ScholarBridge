import express from "express";
import { connect } from "mongoose";
import cors from "cors";
import bodyParser from "body-parser"; // ✅ Correct
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import alumniRoutes from "./routes/alumniRoutes.js";

// Get dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Load environment variables
dotenv.config();

// Configure CORS
app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:5173"], // Allow frontend requests from both default React and Vite ports
		methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
		credentials: true, // Allow sending cookies if needed
	}),
);

// Configure body parsers
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from the uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));
console.log(`Serving static files from: ${uploadsDir}`);

// API routes
app.use("/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/alumni", alumniRoutes);

// Health check route
app.get("/health", (req, res) => {
	res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Connect to MongoDB
connect(process.env.MONGODB_URI || "mongodb://localhost:27017/scholarbridge", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((err) => {
		console.error("Error connecting to MongoDB", err);
	});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
	console.log(`API available at http://localhost:${PORT}/api`);
	console.log(`Static files available at http://localhost:${PORT}/uploads`);
});
