import { useAuth } from "@/context/AuthContext";
import { Box, Button, Flex, IconButton, Separator, Text, VStack } from "@chakra-ui/react";
import { LuLogOut, LuMoon, LuSun } from "react-icons/lu";
import { NavLink, useNavigate } from "react-router-dom";
import { useColorMode, useColorModeValue } from "../ui/color-mode";

const Sidebar = () => {
	const { colorMode, toggleColorMode } = useColorMode();
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const navItems = [
		{ label: "Dashboard", path: "/dashboard" },
		{ label: "Task Manager", path: "/taskManager" },
		// { label: "Profile", path: "/profile" },
	];

	return (
		<Box w="250px" bg={useColorModeValue("gray.100", "gray.800")} p={4} boxShadow="md">
			<VStack align="stretch" justify="space-between" h="full">
				<VStack align="stretch">
					<Text textStyle="2xl" fontWeight="bold">
						Task Tracker
					</Text>
					<Separator borderColor="current" my="5" />
					<Text>Hi, {user?.name}</Text>
					<Separator borderColor="current" my="5" />
					{navItems.map((item) => (
						<NavLink key={item.path} to={item.path}>
							{({ isActive }) => (
								<Button justifyContent="flex-start" w="100%" variant={isActive ? "solid" : "ghost"}>
									{item.label}
								</Button>
							)}
						</NavLink>
					))}
				</VStack>

				<Flex alignItems="center" justifyContent="center" gap={3}>
					<IconButton aria-label="Toggle theme" onClick={toggleColorMode} flex="1">
						{colorMode === "light" ? <LuMoon /> : <LuSun />}
					</IconButton>

					<Button
						flex="1"
						variant="solid"
						colorPalette="red"
						onClick={() => {
							logout();
							navigate("/login");
						}}
					>
						<LuLogOut />
						Logout
					</Button>
				</Flex>
			</VStack>
		</Box>
	);
};

export default Sidebar;
