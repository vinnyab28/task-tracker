import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "../Sidebar/Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<Flex h="100vh">
			<Sidebar />
			<Box flex="1" p={6} overflowY="auto">
				{children}
			</Box>
		</Flex>
	);
};

export default Layout;
