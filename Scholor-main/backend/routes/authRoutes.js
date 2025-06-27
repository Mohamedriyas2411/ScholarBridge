import { Router } from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Student from "../models/Student.js"; // ✅ Corrected Import
const router = Router();
import Alumini from "../models/Alumini.js";
import Application from "../models/ApplicationSchema.js";

// Load environment variables
dotenv.config();

// Get JWT secret from environment or use fallback
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// User Registration
router.post("/register", async (req, res) => {
	try {
		const { username, email, password } = req.body;
	
		// Check for existing user
		const existingUser = await Student.findOne({ email });
		console.log("logged");
		if (existingUser) {
			return res.status(400).json({ message: "user already exists" });
		}
	
		// Hash password
		const hashedPassword = await hash(password, 10);
	
		// Create new student
		const newStudent = new Student({
			username,
			email,
			password: hashedPassword,
		});
	
		// Save student first
		const savedStudent = await newStudent.save();
	
		// Create corresponding application
		const newApplication = new Application({
			student: savedStudent._id,
		});
		const savedApplication = await newApplication.save();
	
		// Update student with application ID
		savedStudent.applicationId = savedApplication._id;
		await savedStudent.save();
	
		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error registering user", error: error.message });
	}
});

router.post("/aluminiRegister", async (req, res) => {
	try {
		console.log(req.body);
		const { username, email, password, aluminiId } = req.body;
		
		// Check if alumni ID already exists
		const existingAluminiId = await Alumini.findOne({ aluminiId });
		if (existingAluminiId) {
			return res.status(400).json({ message: "Alumni ID already exists" });
		}
		
		// Check if email already exists
		const existingUser = await Alumini.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "Email already exists" });
		}

		const hashedPassword = await hash(password, 10);
		const newAlumni = new Alumini({
			username,
			email,
			password: hashedPassword,
			aluminiId
		});
		await newAlumni.save();
		res.status(201).json({ message: "Alumni registered successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error registering Alumni", error: error.message });
	}
});

// User Login
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		const student = await Student.findOne({ email }); // ✅ FIXED
		if (!student || !(await compare(password, student.password))) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Create token with _id field to match what auth middleware expects
		const token = jwt.sign(
			{ 
				_id: student._id, 
				username: student.username,
				email: student.email 
			},
			JWT_SECRET,
			{ expiresIn: "24h" },
		);
		
		res.json({ 
			token,
			user: {
				_id: student._id,
				username: student.username,
				email: student.email
			}
		});
	} catch (error) {
		res.status(500).json({ message: "Error logging in", error: error.message });
	}
});

router.post("/aluminiLogin", async (req, res) => {
	try {
		const { aluminiId, password } = req.body;
		const alumini = await Alumini.findOne({ aluminiId }); // ✅ FIXED
		if (!alumini || !(await compare(password, alumini.password))) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		// Create token with _id field to match what auth middleware expects
		const token = jwt.sign(
			{ 
				_id: alumini._id, 
				username: alumini.username,
				email: alumini.email
			},
			JWT_SECRET,
			{ expiresIn: "24h" },
		);
		
		res.json({ 
			token,
			user: {
				_id: alumini._id,
				username: alumini.username,
				email: alumini.email
			}
		});
	} catch (error) {
		res.status(500).json({ message: "Error logging in", error: error.message });
	}
});

export default router;
