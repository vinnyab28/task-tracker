import { Box, Heading } from "@chakra-ui/react";

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Box flex="1" p={6} overflowY="auto">
				<Heading></Heading>
				{children}
			</Box>
		</>
	);
};

export default Layout;
