import logo from "./logo.svg";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AluminiLogin from "./pages/AluminiLogin";
import AluminiRegister from "./pages/AluminiRegister";
import Dashboard from "./pages/student/Dashboard";
import AvailableScholarships from "./pages/student/AvailableScholarships";
import MyApplications from "./pages/student/MyApplications";
import ConnectWithAlumni from "./pages/student/ConnectWithAlumni ";
import StudentProfile from "./pages/student/StudentProfile";
import FillToApply from "./pages/student/FillToApply";
import AlumniDashboard from "./pages/alumini/AlumniDashboard";
import IncomingRequests from "./pages/alumini/IncomingRequests";
import AlumniMentorship from "./pages/alumini/AlumniMentorship";
import { Route, Routes, BrowserRouter } from "react-router-dom";

function App() {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/aluminiLogin" element={<AluminiLogin />} />
					<Route path="/aluminiRegister" element={<AluminiRegister />} />
					<Route path="/studDash" element={<Dashboard />} />
					<Route path="/alumniconnect" element={<ConnectWithAlumni />} />
					<Route path="/profile" element={<StudentProfile />} />
					<Route path="/fill-to-apply" element={<FillToApply />} />
					<Route path="/payment-requests" element={<AvailableScholarships />} />
					<Route path="/aluminidash" element={<AlumniDashboard />} />
					<Route path="/requests" element={<IncomingRequests />} />
					<Route path="/scholarships" element={<AlumniMentorship />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
