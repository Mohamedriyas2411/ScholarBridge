import React, { useState } from "react";
import axios from "axios";
import fb from "../assets/facebook.png";
import insta from "../assets/insta.png";
import youtube from "../assets/youtube.png";

const AluminiRegister = () => {
	// State for form data
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		aluminiId: "",
	});
	
	// State for error messages
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Handle form field changes
	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.id]: e.target.value });
		// Clear error when user starts typing
		setError("");
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");
		setSuccess("");

		// Check if passwords match
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match!");
			setIsSubmitting(false);
			return;
		}

		try {
			const response = await axios.post(
				"http://localhost:8080/auth/aluminiRegister",
				{
					username: formData.username,
					email: formData.email,
					password: formData.password,
					aluminiId: formData.aluminiId,
				},
				{
					withCredentials: true, // Allow credentials
				},
			);

			setSuccess("Alumni registered successfully! Redirecting to login...");
			console.log(response.data);
			
			// Redirect to login page after 2 seconds
			setTimeout(() => {
				window.location.href = "/aluminilogin";
			}, 2000);
			
		} catch (error) {
			console.error("Registration error:", error);
			if (error.response && error.response.data && error.response.data.message) {
				setError(error.response.data.message);
			} else {
				setError("Error registering alumni. Please try again.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="login-container">
			<h2>Alumni Register</h2>
			<p>Create your account to get started</p>
			
			{error && <div className="error-message">{error}</div>}
			{success && <div className="success-message">{success}</div>}

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
				<label htmlFor="aluminiId">Alumni ID</label>
				<input
					type="text"
					id="aluminiId"
					placeholder="Enter your Alumni ID"
					value={formData.aluminiId}
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

				<label htmlFor="confirmPassword">Confirm Password</label>
				<input
					type="password"
					id="confirmPassword"
					placeholder="●●●●●●●●"
					value={formData.confirmPassword}
					onChange={handleChange}
					required
				/>

				<button type="submit" className="sign-in-btn" disabled={isSubmitting}>
					{isSubmitting ? "Registering..." : "Register"}
				</button>

				<div className="social-login">
					<img src={fb} alt="Facebook" />
					<img src={youtube} alt="YouTube" />
					<img src={insta} alt="Instagram" />
				</div>

				<p className="create-account">
					Already have an account? <a href="/aluminilogin">Sign in</a>
				</p>
				<p className="create-account">
					<a href="/register">Student Registration</a>
				</p>
			</form>
		</div>
	);
};

export default AluminiRegister;
