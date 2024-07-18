import type { Meta } from "storybook-solidjs";
import { Toaster, useToaster } from ".";
import { Button } from "../button";

const meta = {
	title: "Toast",
	argTypes: {},
} satisfies Meta<ReturnType<typeof useToaster>>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ToastExample = () => {
	const toast = useToaster();
	return (
		<>
			<Button
				onClick={async () => {
					toast(() => <div>Hello World</div>, { duration: 3000 });
					await sleep(2000);
					toast(() => <div>Hello world 2</div>, { duration: 3000 });
				}}
			>
				Create toast
			</Button>
			<Toaster label="Notifications" />
		</>
	);
};

export default meta;
