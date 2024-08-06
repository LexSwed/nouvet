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
			<fieldset>
				<Text as="legend" with="overline">
					What to do in life?
				</Text>
				<div class="mt-4 flex flex-row gap-4">
					<Button
						tone="secondary"
						onClick={async () => {
							toast(() => (
								<Toast class="max-w-80">
									<Text tone="success">Succeeded</Text>
									<Text with="body-sm">The success has suddenly come</Text>
								</Toast>
							));
						}}
					>
						Succeed
					</Button>
					<Button
						tone="destructive"
						onClick={async () => {
							toast(() => (
								<Toast class="max-w-80" tone="failure">
									<Text tone="danger">Failed</Text>
									<Text with="body-sm">You have successfully failed.</Text>
								</Toast>
							));
						}}
					>
						Fail
					</Button>
				</div>
			</fieldset>
			<Toaster label="Notifications" />
		</>
	);
};

export default meta;
