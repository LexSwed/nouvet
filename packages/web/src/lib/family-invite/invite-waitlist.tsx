import { UTCDate } from "@date-fns/utc";
import { Avatar, Button, ButtonLink, Card, Chip, Icon, Text } from "@nou/ui";
import { createAsync, useMatch } from "@solidjs/router";
import { differenceInMinutes } from "date-fns/differenceInMinutes";
import { Match, Show, Suspense, Switch } from "solid-js";

import { getFamilyMembers } from "~/server/api/family";
import { getUserFamily } from "~/server/api/user";
import { createTranslator } from "~/server/i18n";

import { FamilyNameForm } from "./family-name-form";
import { WaitingFamilyConfirmation } from "./waiting-family-confirmation";

export const InviteWaitlist = (props: { onNext: () => void }) => {
	const t = createTranslator("family");

	const user = createAsync(() => getUserFamily());

	const recentMember = createAsync(async () => {
		const members = await getFamilyMembers();
		return (
			members.find((member) => member.role === "waiting") ||
			members.find((member) => {
				return differenceInMinutes(new UTCDate(), new UTCDate(member.joinedAt)) < 60;
			})
		);
	});

	return (
		<div class="flex flex-col gap-6">
			<Suspense
				fallback={
					// TODO: Create Skeleton component
					<div class="h-[200px] w-full animate-pulse self-center rounded-3xl bg-on-surface/12" />
				}
			>
				<Switch>
					<Match when={!recentMember()}>
						<div class="flex flex-col items-center justify-center gap-6">
							<Icon use="video-conference" size="lg" class="text-on-primary-container" />
							<Text class="text-balance text-center">{t("invite.waitlist-empty")}</Text>
						</div>
					</Match>
					<Match when={recentMember()?.role === "waiting" && recentMember()}>
						{(user) => <WaitingFamilyConfirmation user={user()} />}
					</Match>
					<Match when={recentMember()?.role === "member" && recentMember()}>
						{(member) => (
							<NewlyJoinedMember
								familyName={user()?.family?.name}
								user={member()}
								onNavigate={() => {
									props.onNext();
								}}
							/>
						)}
					</Match>
				</Switch>
				<Button
					onClick={() => {
						props.onNext();
					}}
				>
					{t("invite.waitlist-done")}
				</Button>
			</Suspense>
		</div>
	);
};

const NewlyJoinedMember = (props: {
	familyName: string | null | undefined;
	user: {
		id: string;
		name: string | null;
		avatarUrl: string | null;
	};
	onNavigate: () => void;
}) => {
	const t = createTranslator("family");
	const isFamilyUrl = useMatch(() => "/app/family");

	return (
		<div class="flex flex-col gap-6">
			<div class="flex flex-row items-end gap-4">
				<div class="flex-[2]">
					<FamilyNameForm familyName={props.familyName} />
				</div>
				<Show when={!isFamilyUrl()}>
					<ButtonLink href="/app/family" onClick={props.onNavigate} icon variant="ghost">
						<Icon use="arrow-up-right" size="md" />
					</ButtonLink>
				</Show>
			</div>
			<Card
				variant="outlined"
				class="flex flex-col gap-4"
				style={{ "view-transition-name": `family-member-${props.user.id}` }}
			>
				<Chip tone="primary" class="-me-2 -mt-2">
					<Icon use="check-fat" size="xs" />
					{t("waitlist.just-joined")}
				</Chip>

				<ButtonLink
					href={`/app/family/${props.user.id}`}
					variant="ghost"
					class="-m-3 flex flex-row items-center justify-start gap-4 rounded-xl p-3"
					onClick={props.onNavigate}
				>
					<Avatar avatarUrl={props.user.avatarUrl || ""} name={props.user.name || ""} size="xl" />
					<Text with="body-xl">{props.user.name}</Text>
					<Icon use="carret-right" size="md" class="ms-auto text-on-surface/80" />
				</ButtonLink>
			</Card>
		</div>
	);
};
