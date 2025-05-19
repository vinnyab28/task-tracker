import { Spinner, Text, VStack } from "@chakra-ui/react";

const Loader = ({ showText = false }: { showText: boolean }) => {
	return (
		<VStack justifyContent="center" alignItems="center" colorPalette="teal" w="full" h="full">
			<Spinner color="colorPalette.600" />
			{showText && <Text color="colorPalette.600">Loading...</Text>}
		</VStack>
	);
};

export default Loader;
