import {
	Avatar,
	Button,
	ButtonLink,
	Card,
	Drawer,
	Form,
	Icon,
	Image,
	Menu,
	MenuItem,
	Popover,
	Text,
} from "@nou/ui";
import { type RouteDefinition, createAsync, useSubmission } from "@solidjs/router";
import { For, Match, Show, Suspense, Switch } from "solid-js";

import { cancelFamilyJoin, getFamilyMembers, leaveFamily } from "~/server/api/family";
import { getUserFamily } from "~/server/api/user";
import { T, cacheTranslations, createTranslator } from "~/server/i18n";

import { FamilyInviteDialog } from "~/lib/family-invite";
import { FamilyNameForm } from "~/lib/family-invite/family-name-form";
import { WaitingFamilyConfirmation } from "~/lib/family-invite/waiting-family-confirmation";

export const route = {
	preload() {
		void cacheTranslations("family");
		void getUserFamily();
		void getFamilyMembers();
	},
} satisfies RouteDefinition;

export default function FamilyRootPage() {
	const user = createAsync(() => getUserFamily());
	const familyMembers = createAsync(() => getFamilyMembers());

	const isOwner = () => user()?.family?.role === "owner";
	const hasMembers = () => {
		const members = familyMembers();
		return members && members.length > 0;
	};
	return (
		<>
			<section class="container flex flex-col gap-8">
				<FamilyHeader />
				<Suspense>
					<Switch>
						<Match when={user()?.family?.role === "waiting"}>
							<WaitingApproval />
						</Match>
						<Match when={hasMembers()}>
							<div class="flex flex-col gap-6">
								<Suspense>
									<FamilyMembers />
									<Card variant="flat">Render all users timeline</Card>
								</Suspense>
							</div>
						</Match>
						<Match when={isOwner() && !hasMembers()}>
							<EmptyFamily />
						</Match>
					</Switch>
				</Suspense>
			</section>
			<FamilyInviteDialog id="family-invite" />
		</>
	);
}

function FamilyHeader() {
	const t = createTranslator("family");
	const user = createAsync(() => getUserFamily());
	const isOwner = () => user()?.family?.role === "owner";
	return (
		<>
			<Switch>
				<Match when={isOwner()}>
					<div class="flex flex-col gap-4 sm:flex-row sm:items-end">
						<FamilyNameForm familyName={user()?.family?.name} />
						<div class="mb-1 flex flex-row gap-2">
							<Button variant="tonal" size="sm" popoverTarget="family-invite" class="gap-2">
								<Icon use="user-circle-plus" class="-ms-1" />
								{t("action.add-users")}
							</Button>
							<Button
								variant="ghost"
								icon
								size="sm"
								label={t("action.more")}
								popoverTarget="family-owner-menu"
								class="gap-2"
							>
								<Icon use="dots-three-outline-vertical" />
							</Button>
							<Menu id="family-owner-menu" placement="top-to-bottom right-to-right">
								<MenuItem
									tone="destructive"
									popoverTarget="family-delete"
									as="button"
									type="button"
								>
									<Icon use="trash-simple" />
									{t("action.disassemble")}
								</MenuItem>
							</Menu>

							<Drawer
								placement="center"
								id="family-delete"
								class="md:max-w-[600px]"
								heading={t("delete-family.headline")}
							>
								{(open) => (
									<Show when={open()}>
										<div class="grid items-center gap-8 sm:grid-cols-[1fr,2fr]">
											<div class="max-w-[200px] justify-self-center overflow-hidden rounded-full border-2 border-outline bg-primary-container/20">
												<Image
													src="/assets/images/family-breakup.png"
													width={300}
													aspectRatio="1/1"
													alt=""
												/>
											</div>
											<div class="flex flex-col gap-8">
												<Text as="p">
													<T>{t("delete-family.description")}</T>
												</Text>
												<div class="grid grid-cols-2 gap-2">
													<Button
														variant="outline"
														popoverTarget="family-delete"
														popoverTargetAction="hide"
													>
														{t("delete-family.cancel")}
													</Button>
													<Button variant="outline" tone="destructive">
														{t("delete-family.cta")}
													</Button>
												</div>
											</div>
										</div>
									</Show>
								)}
							</Drawer>
						</div>
					</div>
				</Match>
				<Match when={!isOwner()}>
					<FamilyHeaderMember />
				</Match>
			</Switch>
		</>
	);
}

function FamilyHeaderMember() {
	const t = createTranslator("family");
	const user = createAsync(() => getUserFamily());
	const leaveFamilySubmission = useSubmission(leaveFamily);
	return (
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
			<Text with="headline-1">{user()?.family?.name || t("no-name")}</Text>
			<Show when={user()?.family?.role === "member"}>
				<ul>
					<li>
						<Button
							size="sm"
							variant="ghost"
							popoverTarget="family-menu"
							class="gap-2"
							icon
							label="Actions on family"
						>
							<Icon use="dots-three-outline-vertical" />
						</Button>
					</li>
				</ul>
				<Menu id="family-menu" placement="top-to-bottom right-to-right">
					<MenuItem tone="destructive" popoverTarget="family-leave" as="button" type="button">
						<Icon use="sign-out" />
						{t("action.leave-family")}
					</MenuItem>
				</Menu>
				<Drawer
					id="family-leave"
					placement="center"
					class="sm:max-w-md"
					heading={t("leave-family.headline")}
				>
					{(open) => (
						<Show when={open()}>
							<div class="flex flex-col gap-4">
								<Text as="p">{t("leave-family.description")}</Text>
								<Form action={leaveFamily} class="mt-4 grid grid-cols-2 gap-4 md:self-end">
									<Button
										variant="ghost"
										popoverTargetAction="hide"
										popoverTarget="family-leave"
										class="rounded-full"
									>
										{t("leave-family.cancel")}
									</Button>
									<Button
										variant="outline"
										tone="destructive"
										type="submit"
										pending={leaveFamilySubmission.pending}
									>
										{t("leave-family.confirm")}
									</Button>
								</Form>
							</div>
						</Show>
					)}
				</Drawer>
			</Show>
		</div>
	);
}

function WaitingApproval() {
	const t = createTranslator("family");
	const cancelJoinSubmission = useSubmission(cancelFamilyJoin);
	return (
		<>
			<Card class="flex flex-col items-center gap-4 bg-main p-8 sm:flex-row">
				<div class="flex flex-col gap-6">
					<Text as="h2" with="headline-2">
						{t("waiting.headline")}
					</Text>
					<Text as="p">{t("waiting.description")}</Text>
					<div class="self-end">
						<Button variant="tonal" tone="destructive" popoverTarget="cancel-join-drawer">
							{t("waiting.cancel-join-cta")}
						</Button>
					</div>
				</div>
				<div class="-mx-4 -mb-4 sm:-my-4 sm:-me-4 min-h-0 sm:mx-0 sm:mb-0 sm:max-w-[50%] sm:self-stretch">
					<Image
						src="/assets/images/barthelemy-de-mazenod-iw0SowaRxeY-unsplash.jpg"
						width={300}
						aspectRatio="4/3"
						alt={t("waiting.image")!}
						class="h-full max-h-[400px] w-auto rounded-3xl md:max-w-full"
					/>
				</div>
			</Card>
			<Drawer
				id="cancel-join-drawer"
				placement="center"
				class="max-w-md"
				heading={t("waiting.cancel-join-popup-headline")}
			>
				{(open) => (
					<Show when={open()}>
						<div class="flex flex-col gap-4">
							<Text as="p">{t("waiting.cancel-join-popup-description")}</Text>
							<Form action={cancelFamilyJoin} class="mt-4 grid grid-cols-2 gap-4 md:self-end">
								<Button
									variant="ghost"
									popoverTargetAction="hide"
									popoverTarget="cancel-join-drawer"
									class="rounded-full"
								>
									{t("waiting.cancel-join-popup-close")}
								</Button>
								<Button
									variant="outline"
									tone="destructive"
									type="submit"
									pending={cancelJoinSubmission.pending}
								>
									{t("waiting.cancel-join-popup-confirm")}
								</Button>
							</Form>
						</div>
					</Show>
				)}
			</Drawer>
		</>
	);
}

function EmptyFamily() {
	const t = createTranslator("family");
	return (
		<div class="grid grid-flow-row gap-6 sm:grid-flow-col sm:grid-cols-[1fr,2fr] sm:items-center">
			<div class="row-[2] flex flex-col gap-4 sm:row-auto">
				<Text with="headline-2" as="h2">
					{t("no-members-header")}
				</Text>
				<Text as="p">{t("no-members-description")}</Text>
				<Button popoverTarget="family-invite">{t("invite-cta")}</Button>
			</div>
			<div class="row-[1]">
				<Image
					src="/assets/images/andriyko-podilnyk-dWSl8REfpoQ-unsplash.jpg"
					alt=""
					aspectRatio="5/3"
					width={500}
					class="max-h-[300px] rounded-3xl bg-primary/5"
				/>
			</div>
		</div>
	);
}

const FamilyMembers = () => {
	const t = createTranslator("family");
	const familyMembers = createAsync(() => getFamilyMembers());
	return (
		<ul class="flex flex-row flex-wrap items-end justify-stretch gap-2">
			<For each={familyMembers()}>
				{(member) => (
					<Switch>
						<Match when={member.role === "waiting"}>
							<li class="peer/waiting flex basis-full flex-col items-start first:ms-0 peer-[]/waiting:hidden sm:basis-auto md:ms-4">
								<Text id="waiting-to-join-label" with="overline" class="ps-4 text-primary">
									{t("invite.waitlist")}
								</Text>
								<Button
									class="flex w-full flex-col items-start gap-2 rounded-[0.875rem] border border-primary bg-surface p-4 outline-offset-0"
									popoverTarget="family-wait-list"
									variant="ghost"
									tone="primary"
									style={{
										"view-transition-name": `family-member-${member.id}`,
									}}
								>
									<div class="flex flex-row items-center justify-start gap-4">
										<Avatar name={member.name || ""} avatarUrl={member.avatarUrl} />
										<Text with="label">{member.name}</Text>
									</div>
								</Button>
								<Popover
									id="family-wait-list"
									placement="top-to-top left-to-left"
									class="-mt-8 max-w-80 transform-none rounded-3xl p-0"
								>
									<Suspense>
										<WaitingFamilyConfirmation user={member} />
									</Suspense>
								</Popover>
							</li>
						</Match>
						<Match when={member.role === "member"}>
							<Card as="li" class="basis-full p-0.5 sm:basis-auto">
								<ButtonLink
									href={`/app/family/${member.id}`}
									class="flex flex-row items-center justify-start gap-4 rounded-[0.875rem] bg-surface p-4"
									variant="ghost"
								>
									<Avatar name={member.name || ""} avatarUrl={member.avatarUrl} />
									<Text with="label">{member.name}</Text>
								</ButtonLink>
							</Card>
						</Match>
					</Switch>
				)}
			</For>
		</ul>
	);
};
