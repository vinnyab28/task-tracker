import Layout from "@/components/Layout/Layout";
import Sidebar from "@/components/Sidebar/Sidebar";
import TimelineComponent from "@/components/Timeline/Timeline";
import { useDialogComponent } from "@/components/ui/useDialogComponent";
import { Flex } from "@chakra-ui/react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AddRecord from "../pages/AddRecord";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard";
import GoalManager from "../pages/GoalManager";
import TaskManager from "../pages/TaskManager";

const AppRoutes = () => {
	const { user } = useAuth();
	const { DialogComponent } = useDialogComponent();
	if (!user)
		return (
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="*" element={<Navigate to="/login" />} />
			</Routes>
		);

	return (
		<Flex h="100vh">
			<Sidebar />
			<Layout>
				<Routes>
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/taskManager" element={<TaskManager />} />
					<Route path="/goalManager" element={<GoalManager />} />
					<Route path="/add" element={<AddRecord />} />
					<Route path="*" element={<Navigate to="/dashboard" />} />
				</Routes>
			</Layout>
			<TimelineComponent />
			{DialogComponent}
		</Flex>
	);
};

export default AppRoutes;
