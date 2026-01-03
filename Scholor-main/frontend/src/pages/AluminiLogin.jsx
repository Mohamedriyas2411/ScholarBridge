import React, { useState } from "react";
import fb from "../assets/facebook.png";
import insta from "../assets/insta.png";
import youtube from "../assets/youtube.png";
import axios from "axios";

const AluminiLogin = () => {
	// State to store alumni ID and password
	const [aluminiId, setAluminiId] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		// API URL
		const apiUrl = "http://localhost:8080/auth/aluminiLogin";

		try {
			// Send POST request with alumni ID and password
			const response = await axios.post(apiUrl, {
				aluminiId: aluminiId,
				password: password,
			});

			// Handle successful login
			if (response.status === 200) {
				console.log("Login successful!", response.data);
				localStorage.setItem("token", response.data.token); // Store token for future requests
				localStorage.setItem("userType", "alumni"); // Store user type for role-based access
				window.location.href = "/aluminidash"; // Redirect to dashboard
			}
		} catch (error) {
			console.error("Login error:", error);
			// Handle error response
			if (error.response && error.response.data && error.response.data.message) {
				setError(error.response.data.message);
			} else {
				setError("Login failed. Please check your credentials and try again.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="login-page-wrapper">
			<div className="login-container">
				<h2>Alumni Login</h2>
				<p>Please enter your account details</p>
			
			{error && <div className="error-message">{error}</div>}

			<form onSubmit={handleSubmit}>
				<label htmlFor="aluminiId">Alumni ID</label>
				<input
					type="text"
					id="aluminiId"
					placeholder="Enter your Alumni ID"
					required
					value={aluminiId}
					onChange={(e) => {
						setAluminiId(e.target.value);
						setError(""); // Clear error when user types
					}}
				/>

				<label htmlFor="password">Password</label>
				<input
					type="password"
					id="password"
					placeholder="●●●●●●●●"
					required
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
						setError(""); // Clear error when user types
					}}
				/>

				<div className="forgot-password">
					<a href="#">Forgot Password</a>
				</div>

				<button type="submit" className="sign-in-btn" disabled={isSubmitting}>
					{isSubmitting ? "Signing in..." : "Sign in"}
				</button>

				<div className="social-login">
					<img src={fb} alt="Facebook" />
					<img src={youtube} alt="YouTube" />
					<img src={insta} alt="Instagram" />
				</div>

				<p className="create-account">
					<a href="/aluminiregister">Create an account</a>
				</p>
				<p className="create-account">
					<a href="/">Student Login</a>
				</p>
				</form>
			</div>
		</div>
	);
};

export default AluminiLogin;
