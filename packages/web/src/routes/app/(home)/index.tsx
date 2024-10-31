import { Button, ButtonLink, Card, Drawer, Icon } from "@nou/ui";
import { Title } from "@solidjs/meta";
import { type RouteDefinition, createAsync } from "@solidjs/router";
import { For, Match, Show, Suspense, Switch, createUniqueId, lazy } from "solid-js";

import { getUserPets } from "~/server/api/pet";
import { getUserFamily } from "~/server/api/user";
import { createTranslator, queryDictionary } from "~/server/i18n";

import { AppHeader } from "~/lib/app-header";
import { FamilyInviteDialog } from "~/lib/family-invite";
import { PetHomeCard } from "~/lib/pet-home-card";

const CreateNewPetForm = lazy(() => import("~/lib/create-new-pet-form"));

export const route = {
	preload() {
		void queryDictionary("app");
		void getUserPets();
		void getUserFamily();
	},
} satisfies RouteDefinition;

const AppHomePage = () => {
	const t = createTranslator("app");
	const user = createAsync(() => getUserFamily());
	return (
		<>
			<Title>
				<Show when={user()?.family?.name} fallback={t("meta.title-new-user")}>
					{(familyName) => (
						<>
							{t("meta.title", {
								familyName: familyName(),
							})}
						</>
					)}
				</Show>
			</Title>
			<div class="min-h-full bg-background">
				<AppHeader>
					<Suspense>
						<Show when={user()}>
							{(user) => (
								<Switch>
									<Match when={!user().family?.id}>
										<>
											<Button popoverTarget="family-invite" variant="link">
												{t("family.no-name")}
											</Button>
											<FamilyInviteDialog id="family-invite" />
										</>
									</Match>
									<Match when={user().family?.id}>
										<ButtonLink href="/app/family" variant="ghost" tone="primary">
											{user().family?.name ? user().family?.name : t("family.no-name")}
										</ButtonLink>
									</Match>
								</Switch>
							)}
						</Show>
					</Suspense>
				</AppHeader>
				<div class="flex flex-col gap-6">
					<section class="container">
						<Suspense>
							<UserPets />
						</Suspense>
					</section>
				</div>
			</div>
		</>
	);
};

export default AppHomePage;

const UserPets = () => {
	const headingId = createUniqueId();

	const t = createTranslator("app");
	const pets = createAsync(() => getUserPets());
	const user = createAsync(() => getUserFamily());
	const hasPets = () => (pets()?.length ?? 0) > 0;

	return (
		<Switch>
			<Match when={hasPets()}>
				<div>
					<h2 id={headingId} class="sr-only">
						{t("pet-list")}
					</h2>
					<ul class="overflow-snap-4 items-stretch gap-4" aria-labelledby={headingId}>
						<li>
							<Button
								label={t("add-another")}
								size="base"
								icon
								variant="tonal"
								tone="primary"
								popoverTarget="create-new-pet-drawer"
								class="h-full rounded-2xl"
							>
								<Icon use="plus" size="sm" />
							</Button>
							<Drawer
								id="create-new-pet-drawer"
								placement="center"
								role="dialog"
								class="sm:max-w-[420px]"
							>
								{(open) => (
									<Show when={open()}>
										<Suspense>
											<CreateNewPetForm
												onSuccess={() => {
													document.getElementById("create-new-pet-drawer")?.hidePopover();
												}}
											/>
										</Suspense>
									</Show>
								)}
							</Drawer>
						</li>
						<For each={pets()}>
							{(pet) => (
								<li>
									<PetHomeCard
										pet={pet}
										actualOwner={user()?.id === pet.owner?.id ? undefined : pet.owner}
									/>
								</li>
							)}
						</For>
					</ul>
				</div>
			</Match>
			<Match when={!hasPets()}>
				<Card class="flex max-w-[460px] flex-col gap-6 p-4">
					<CreateNewPetForm
						onSuccess={(pet) => {
							document.getElementById(`pet-${pet.id}`)?.focus();
						}}
					/>
					<Show when={!user()?.family}>
						<Button
							popoverTarget="newjoiner-join-family"
							variant="tonal"
							tone="primary"
							class="justify-between gap-2 rounded-2xl p-4 text-start font-normal"
						>
							{t("invite-card-heading")}
							<Icon use="arrow-circle-up-right" class="text-on-primary-container" size="sm" />
						</Button>
						<FamilyInviteDialog initialScreen="join" id="newjoiner-join-family" />
					</Show>
				</Card>
			</Match>
		</Switch>
	);
};
