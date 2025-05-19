import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AddRecord from "../pages/AddRecord";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import TaskManager from "../pages/TaskManager";

const AppRoutes = () => {
	const { user } = useAuth();

	if (!user)
		return (
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="*" element={<Navigate to="/login" />} />
			</Routes>
		);

	return (
		<Routes>
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/taskManager" element={<TaskManager />} />
			<Route path="/profile" element={<Profile />} />
			<Route path="/add" element={<AddRecord />} />
			<Route path="*" element={<Navigate to="/dashboard" />} />
		</Routes>
	);
};

export default AppRoutes;
