import { auth, provider } from "@/firebase";
import { Button, Center, Heading, VStack } from "@chakra-ui/react";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
	return (
		<Center minH="100vh">
			<VStack>
				<Heading>Task Tracker</Heading>
				<Button onClick={() => signInWithPopup(auth, provider)}>Sign in with Google</Button>
			</VStack>
		</Center>
	);
};

export default Login;
