import React, { useState } from "react";
import fb from "../assets/facebook.png";
import insta from "../assets/insta.png";
import youtube from "../assets/youtube.png";
import { login } from "../utils/auth";
import api from "../utils/axios";
import "./Login.css";

const Login = () => {
	// State to store email and password
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			console.log("Attempting login with:", email);
			
			// Use the login function from our auth utility
			const user = await login(email, password);
			
			console.log("Login successful:", user);
			
			// Redirect to dashboard
			window.location.href = "/profile";
		} catch (error) {
			console.error("Login error:", error);
			
			// Set appropriate error message
			if (error.response) {
				setError(error.response.data.message || "Invalid credentials, please try again.");
			} else if (error.request) {
				setError("Could not connect to the server. Please check your internet connection.");
			} else {
				setError("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="login-container">
			<h2>Student Login</h2>
			<p>Please Enter your Account details</p>

			{error && <div className="error-message">{error}</div>}

			<form onSubmit={handleSubmit}>
				<label htmlFor="email">Email</label>
				<input
					type="email"
					id="email"
					placeholder="Johndoe@gmail.com"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					disabled={isLoading}
				/>

				<label htmlFor="password">Password</label>
				<input
					type="password"
					id="password"
					placeholder="●●●●●●●●"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					disabled={isLoading}
				/>

				<div className="forgot-password">
					<a href="#">Forgot Password</a>
				</div>

				<button type="submit" className="sign-in-btn" disabled={isLoading}>
					{isLoading ? "Signing in..." : "Sign in"}
				</button>

				<div className="social-login">
					<img src={fb} alt="Google" />
					<img src={youtube} alt="GitHub" />
					<img src={insta} alt="Facebook" />
				</div>

				<p className="create-account">
					<a href="/register">Create an account</a>
				</p>
				<p className="create-account">
					<a href="/aluminiLogin">Alumini Login</a>
				</p>
			</form>
		</div>
	);
};

export default Login;
