// Script to create a test student profile for development
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarbridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

// Create a test student profile
const createTestStudent = async () => {
  try {
    // Check if test student already exists
    const existingStudent = await Student.findOne({ email: 'teststudent@example.com' });
    
    if (existingStudent) {
      console.log('Test student already exists with ID:', existingStudent._id);
      console.log('Use this ID in your .env file as TEST_USER_ID');
      return existingStudent._id;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create test student
    const testStudent = new Student({
      username: 'teststudent',
      email: 'teststudent@example.com',
      password: hashedPassword,
      phoneNumber: '1234567890',
      dateOfBirth: new Date('2000-01-01'),
      gender: 'Male',
      familyIncome: 50000,
      fatherOccupation: 'Engineer',
      motherOccupation: 'Teacher',
      isSingleParentChild: false,
      currentDegree: 'B.Tech',
      branch: 'Computer Science',
      graduationYear: 2025,
      cgpa: 8.5,
      backlogs: 0,
      tuitionFee: 100000,
      tenthPercentage: 85,
      twelfthPercentage: 80,
      bio: 'This is a test student profile created for development purposes.'
    });
    
    // Save to database
    await testStudent.save();
    
    console.log('Test student created successfully!');
    console.log('Student ID:', testStudent._id);
    console.log('Use this ID in your .env file as TEST_USER_ID');
    
    return testStudent._id;
  } catch (error) {
    console.error('Error creating test student:', error);
    return null;
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Execute the function
createTestStudent(); 