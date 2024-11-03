import { Avatar, Button, Card, Form, Icon, Text } from "@nou/ui";
import { useSubmission } from "@solidjs/router";

import { moveUserFromTheWaitList } from "~/server/api/family-invite";
import { createTranslator } from "~/server/i18n";

export function WaitingFamilyConfirmation(props: {
	user: { name: string | null; id: string; avatarUrl: string | null };
}) {
	const t = createTranslator("family");

	const userWaitListSubmission = useSubmission(moveUserFromTheWaitList);

	return (
		<Card
			// biome-ignore lint/a11y/useSemanticElements: <explanation>
			role="group"
			variant="flat"
			class="flex flex-col gap-4 rounded-3xl border border-on-surface/3 bg-gradient-to-br bg-transparent from-primary/5 via-60% via-transparent to-on-surface/2"
		>
			<Text as="header" with="overline">
				{t("invite.waitlist")}
			</Text>
			<div
				class="flex flex-row items-center justify-start gap-4"
				style={{ "view-transition-name": `family-member-${props.user.id}` }}
			>
				<Avatar avatarUrl={props.user.avatarUrl} name={props.user.name || ""} />
				<Text with="label">{props.user.name}</Text>
			</div>
			<Text as="p" with="body-sm" class="p-2">
				{t("invite.info-consent")}
			</Text>
			<Form action={moveUserFromTheWaitList}>
				<fieldset disabled={userWaitListSubmission.pending} class="flex flex-row gap-2">
					<input type="hidden" name="user-id" value={props.user.id} readOnly />
					<Button
						type="submit"
						value="decline"
						name="action"
						size="sm"
						variant="outline"
						class="flex-1 gap-3"
						aria-disabled={userWaitListSubmission.pending}
						pending={
							userWaitListSubmission.pending &&
							userWaitListSubmission.input[0].get("action") === "decline"
						}
					>
						<Icon use="x" class="-ml-3" />
						{t("invite.waitlist-decline")}
					</Button>
					<Button
						type="submit"
						value="accept"
						name="action"
						size="sm"
						variant="outline"
						class="flex-1 gap-3"
						aria-disabled={userWaitListSubmission.pending}
						pending={
							userWaitListSubmission.pending &&
							userWaitListSubmission.input[0].get("action") === "accept"
						}
					>
						<Icon use="check" class="-ml-2" />
						{t("invite.waitlist-accept")}
					</Button>
				</fieldset>
			</Form>
		</Card>
	);
}
