import { Button, Form, Icon, Popover, TextField } from "@nou/ui";
import { action, json, redirect, useSubmission } from "@solidjs/router";

import { loginDevServer } from "~/server/api/dev-login.server";
import type { UserID } from "~/server/types";

const DevLogin = () => {
	const login = useSubmission(loginDev);
	return (
		<>
			<Button variant="ghost" popoverTarget="dev-login" icon label="Developer login">
				<Icon use="carrot" />
			</Button>
			<Popover
				id="dev-login"
				class="w-[320px] p-8"
				heading={"Dev login"}
				placement="top-to-bottom right-to-right"
			>
				<Form
					validationErrors={
						login.result && "errors" in login.result ? login.result.errors : undefined
					}
					action={loginDev}
					class="flex flex-col gap-4"
				>
					<TextField name="name" label="Name" />
					<Button type="submit" pending={login.pending}>
						Login
					</Button>
				</Form>
			</Popover>
		</>
	);
};

export default DevLogin;

const loginDev = action(async (formData: FormData) => {
	"use server";
	const name = formData.get("name")?.toString().trim();
	if (!name) {
		return json({ errors: { name: "Cannot be empty " } }, { status: 500, revalidate: "none" });
	}
	try {
		const { redirectUrl } = await loginDevServer(name as UserID);
		return redirect(redirectUrl);
	} catch {
		return json({ failed: true }, { status: 500, revalidate: "none" });
	}
}, "dev-login");
