import type { Meta } from "storybook-solidjs";
import { Toast, Toaster, useToaster } from ".";
import { Button } from "../button";
import { Text } from "../text";

const meta = {
	title: "Toast",
	argTypes: {},
} satisfies Meta<ReturnType<typeof Toast>>;

export const ToastExample = () => {
	const toast = useToaster();
	return (
		<>
			<div class="flex flex-row gap-4">
				<Button
					onClick={async () => {
						if (Math.random() > 0.4) {
							toast(() => (
								<Toast class="max-w-80" tone="secondary">
									<Text tone="success">Saved</Text>
									<Text with="body-sm">The information is saved successfully</Text>
								</Toast>
							));
						} else {
							toast(() => (
								<Toast class="max-w-80" tone="failure">
									<Text tone="danger">Failed</Text>
									<Text with="body-sm">
										It was not possible to save the information at this moment. Try again.
									</Text>
								</Toast>
							));
						}
					}}
				>
					Save information
				</Button>
			</div>
			<Toaster label="Notifications" />
		</>
	);
};

export default meta;
