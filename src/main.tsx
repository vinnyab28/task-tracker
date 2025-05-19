import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ColorModeProvider } from "./components/ui/color-mode";
import { Toaster } from "./components/ui/toaster";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ChakraProvider value={defaultSystem}>
			<ColorModeProvider>
				<App />
				<Toaster />
			</ColorModeProvider>
		</ChakraProvider>
	</React.StrictMode>
);
