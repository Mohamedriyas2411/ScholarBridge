import React, { useState } from "react";
import axios from "axios";
import fb from "../assets/facebook.png";
import insta from "../assets/insta.png";
import youtube from "../assets/youtube.png";
const Register = () => {
	// State for form data
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	// Handle form field changes
	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.id]: e.target.value });
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Check if passwords match
		if (formData.password !== formData.confirmPassword) {
			alert("Passwords do not match!");
			return;
		}

		try {
			const response = await axios.post(
				"http://localhost:8080/auth/register",
				{
					username: formData.username,
					email: formData.email,
					password: formData.password,
				},
				{
					withCredentials: true, // ✅ Add this to allow credentials
				},
			);

			alert("User registered successfully!");
			console.log(response.data);
		} catch (error) {
			alert("Error registering user: " + error.response?.data || error.message);
		}
	};

	return (
		<div className="login-page-wrapper">
			<div className="login-container">
				<h2>Student Register</h2>
				<p>Create your account to get started</p>

			<form onSubmit={handleSubmit}>
				<label htmlFor="username">Username</label>
				<input
					type="text"
					id="username"
					placeholder="Enter your username"
					value={formData.username}
					onChange={handleChange}
					required
				/>

				<label htmlFor="email">Email</label>
				<input
					type="email"
					id="email"
					placeholder="Johndoe@gmail.com"
					value={formData.email}
					onChange={handleChange}
					required
				/>

				<label htmlFor="password">Password</label>
				<input
					type="password"
					id="password"
					placeholder="●●●●●●●●"
					value={formData.password}
					onChange={handleChange}
					required
				/>

				<label htmlFor="confirm-password">Confirm Password</label>
				<input
					type="password"
					id="confirmPassword"
					placeholder="●●●●●●●●"
					value={formData.confirmPassword}
					onChange={handleChange}
					required
				/>

				<button type="submit" className="sign-in-btn">
					Register
				</button>

				<div className="social-login">
					<img src={fb} alt="Google" />
					<img src={youtube} alt="GitHub" />
					<img src={insta} alt="Facebook" />
				</div>

				<p className="create-account">
					Already have an account? <a href="/">Sign in</a>
				</p>
				<p className="create-account">
					<a href="/aluminiRegister">Alumini Registration</a>
				</p>
				</form>
			</div>
		</div>
	);
};

export default Register;
