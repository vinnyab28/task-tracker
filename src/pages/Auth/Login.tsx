import StyledFirebaseAuth from "@/components/ui/StyledFirebaseAuth";
import { auth, uiConfig } from "@/firebase";
import { Center, Heading, VStack } from "@chakra-ui/react";

const Login = () => {
	return (
		<Center minH="100vh">
			<VStack>
				<Heading>Task Tracker</Heading>
				<StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
			</VStack>
		</Center>
	);
};

export default Login;
