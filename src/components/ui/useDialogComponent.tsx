import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { useState } from "react";
export const useDialogComponent = () => {
	const [open, setOpen] = useState(false);

	const openDialog = () => {
		console.log("open");
		setOpen(true);
	};

	const DialogComponent = (
		<Dialog.Root open={open}>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Dialog Title</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.ActionTrigger asChild>
								<Button variant="outline">Cancel</Button>
							</Dialog.ActionTrigger>
							<Button>Save</Button>
						</Dialog.Footer>
						<Dialog.CloseTrigger asChild>
							<CloseButton size="sm" />
						</Dialog.CloseTrigger>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);

	return { openDialog, DialogComponent };
};
