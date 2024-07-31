import type { Meta } from "storybook-solidjs";
import { Toast, Toaster, useToaster } from ".";
import { Button } from "../button";

const meta = {
	title: "Toast",
	argTypes: {},
} satisfies Meta<ReturnType<typeof Toast>>;

export const ToastExample = () => {
	const toast = useToaster();
	let counter = 0;
	return (
		<>
			<Button
				onClick={async () => {
					counter = counter + 1;
					toast(() => <Toast class="max-w-80">#{counter} toast</Toast>);
				}}
			>
				Create toast
			</Button>
			<Toaster label="Notifications" />
		</>
	);
};

export default meta;
