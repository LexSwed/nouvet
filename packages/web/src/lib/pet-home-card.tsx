import {
	Avatar,
	Button,
	Card,
	Icon,
	MenuItem,
	MenuList,
	Popover,
	SplitButton,
	type SvgIcons,
	Text,
} from "@nou/ui";
import { A } from "@solidjs/router";
import { ErrorBoundary, Match, Show, Suspense, Switch, createUniqueId } from "solid-js";

import type { DatabasePet, UserID } from "~/server/db/schema";
import { createTranslator } from "~/server/i18n";

import { createPersistedSetting } from "~/lib/utils/make-persisted-signal";

import AddBirthDateForm from "./add-birthdate-form";
import AddBreedForm from "./add-pet-breed";
import AddWeightForm from "./add-weight-form";

interface PetHomeCardProps {
	pet: {
		id: string;
		pictureUrl: string | null;
		name: string;
		species: DatabasePet["species"];
		gender: DatabasePet["gender"];
		breed: string | null;
		dateOfBirth: string | null;
		color: string | null;
		weight: number | null;
	};
	owner:
		| {
				id: UserID;
				name: string | null | undefined;
				avatarUrl: string | null | undefined;
		  }
		| undefined
		| null;
}

const petIconMap: Record<DatabasePet["species"], SvgIcons> = {
	dog: "dog",
	cat: "cat",
	bird: "bird",
	rodent: "rodent",
	rabbit: "rabbit",
	horse: "horse",
};

export const PetHomeCard = (props: PetHomeCardProps) => {
	const petPopoverId = `popover-${createUniqueId()}`;
	let triggerRef: HTMLElement | null = null;
	const t = createTranslator("app");

	const hasMissingInfo = () => !props.pet.dateOfBirth || !props.pet.weight || !props.pet.breed;

	return (
		<Card
			class="flex min-w-52 flex-col gap-4 rounded-2xl p-0.5"
			ref={(el: HTMLElement) => {
				triggerRef = el;
			}}
		>
			<Button
				variant="ghost"
				class="flex h-auto cursor-pointer flex-row items-center justify-start gap-4 rounded-[0.875rem] p-3"
				popoverTarget={petPopoverId}
				id={`pet-${props.pet.id}`}
			>
				<div class="grid size-16 shrink-0 place-content-center rounded-full bg-tertiary/10 text-tertiary">
					<Show
						when={props.pet.pictureUrl}
						children={(picture) => <img src={picture()} class="aspect-square w-full" alt="" />}
						fallback={<Icon use={petIconMap[props.pet.species]} size="md" />}
					/>
				</div>
				<Text with="body-lg">{props.pet.name}</Text>
				<Show when={props.owner}>
					{(owner) => (
						<div class="-m-1 ms-auto self-start rounded-full bg-surface p-1">
							<Avatar avatarUrl={owner().avatarUrl || ""} name={owner().name || ""} size="xs" />
						</div>
					)}
				</Show>
			</Button>
			<ErrorBoundary
				fallback={(error) => {
					console.error(error);
					return null;
				}}
			>
				<div class="-mt-6 flex flex-row items-center gap-2 px-3 py-2 empty:hidden">
					<Show when={hasMissingInfo()}>
						<Suspense fallback={null}>
							<QuickSetters pet={props.pet} />
						</Suspense>
					</Show>
				</div>
			</ErrorBoundary>
			<Popover
				id={petPopoverId}
				placement="top-to-top left-to-left"
				class="-m-1 flex transform-none flex-col gap-4 p-2"
				onToggle={(e: ToggleEvent) => {
					if (triggerRef && e.newState === "open") {
						triggerRef.scrollIntoView({
							inline: "start",
							behavior: "smooth",
						});
					}
				}}
			>
				<A
					href={`/app/pets/${props.pet.id}/`}
					class="group/link -m-2 -outline-offset-4 flex flex-row items-center gap-4 rounded-[inherit] p-4 outline-on-surface focus:outline-4"
				>
					<div class="grid size-16 shrink-0 place-content-center rounded-full bg-tertiary/10 text-tertiary">
						<Show
							when={props.pet.pictureUrl}
							children={<img src={props.pet.pictureUrl!} class="aspect-square w-full" alt="" />}
							fallback={<Icon use={petIconMap[props.pet.species]} size="md" />}
						/>
					</div>
					<Text with="body-lg">{props.pet.name}</Text>
					<Text class="sr-only">{t("go-to-pet-page", { petName: props.pet.name })}</Text>
					<div class="ms-auto grid cursor-pointer place-content-center rounded-full bg-on-surface/5 p-3 transition-colors duration-200 group-hover/link:bg-on-surface/8">
						<Icon use="pencil" size="sm" />
					</div>
				</A>
				<MenuList class="min-w-56">
					<Show when={props.owner}>
						{(owner) => (
							<MenuItem as={A} href={`/app/family/${owner().id}/`}>
								<Avatar avatarUrl={owner().avatarUrl || ""} name={owner().name || ""} size="xs" />
								<Text>{owner().name || t("pet-owner-no-name")}</Text>
							</MenuItem>
						)}
					</Show>
					<MenuItem as={A} href={`/app/pets/${props.pet.id}/`}>
						<Icon use="pencil" size="sm" />
						{t("pet-menu.edit-info")}
					</MenuItem>
					<MenuItem as="button" type="button" popoverTarget={`${props.pet.id}-menu-weight`}>
						<Icon use="scales" size="sm" />
						{t("pet-menu.add-weight")}
					</MenuItem>
					<MenuItem>
						<Icon use="note" size="sm" />
						{t("pet-menu.add-note")}
					</MenuItem>
					<MenuItem>
						<Icon use="aid" size="sm" />
						{t("pet-menu.book")}
					</MenuItem>
				</MenuList>
				<AddWeightForm
					id={`${props.pet.id}-menu-weight`}
					pet={props.pet}
					anchor={petPopoverId}
					placement="center"
				/>
			</Popover>
		</Card>
	);
};

function QuickSetters(props: { pet: PetHomeCardProps["pet"] }) {
	const t = createTranslator("pet-forms");

	const [qs, toggle] = createPersistedSetting(`qs-toggles-${props.pet.id}`, {
		showBirthDate: !props.pet.dateOfBirth,
		showWeight: !props.pet.weight,
		showBreed: !props.pet.breed,
	});

	return (
		<Switch>
			<Match when={qs()?.showBirthDate}>
				<SplitButton
					variant="outline"
					class="max-w-48 gap-1 bg-surface outline outline-4 outline-surface"
					size="sm"
				>
					<SplitButton.Inner popoverTarget={`${props.pet.id}-birth-date`} class="gap-2 text-nowrap">
						<Icon use="calendar-plus" size="sm" />
						<Text with="label-sm">{t("animal-shortcut.birth-date")}</Text>
					</SplitButton.Inner>
					<SplitButton.Inner
						icon
						label={t("animal.drawer.cancel")}
						class="gap-2 text-nowrap"
						onClick={() => toggle((old) => ({ ...old, showBirthDate: false }))}
					>
						<Icon use="x" size="xs" />
					</SplitButton.Inner>
				</SplitButton>
				<AddBirthDateForm
					id={`${props.pet.id}-birth-date`}
					pet={props.pet}
					onDismiss={() => toggle((old) => ({ ...old, showBirthDate: false }))}
				/>
			</Match>
			<Match when={qs()?.showWeight}>
				<SplitButton
					variant="outline"
					class="max-w-48 gap-1 bg-surface outline outline-4 outline-surface"
					size="sm"
				>
					<SplitButton.Inner popoverTarget={`${props.pet.id}-weight`} class="gap-2 text-nowrap">
						<Icon use="scales" size="sm" />
						<Text with="label-sm">{t("animal-shortcut.weight")}</Text>
					</SplitButton.Inner>
					<SplitButton.Inner
						icon
						label={t("animal.drawer.cancel")}
						class="gap-2 text-nowrap"
						onClick={() => toggle((old) => ({ ...old, showWeight: false }))}
					>
						<Icon use="x" size="xs" />
					</SplitButton.Inner>
				</SplitButton>
				<AddWeightForm
					id={`${props.pet.id}-weight`}
					pet={props.pet}
					onDismiss={() => toggle((old) => ({ ...old, showWeight: false }))}
				/>
			</Match>
			<Match when={qs()?.showBreed}>
				<SplitButton
					variant="outline"
					class="max-w-48 gap-1 bg-surface outline outline-4 outline-surface"
					size="sm"
				>
					<SplitButton.Inner popoverTarget={`${props.pet.id}-breed`} class="gap-2 text-nowrap">
						<Icon use="paw-print" size="sm" />
						<Text with="label-sm">{t("animal-shortcut.breed")}</Text>
					</SplitButton.Inner>
					<SplitButton.Inner
						icon
						label={t("animal.drawer.cancel")}
						class="gap-2 text-nowrap"
						onClick={() => toggle((old) => ({ ...old, showBreed: false }))}
					>
						<Icon use="x" size="xs" />
					</SplitButton.Inner>
				</SplitButton>
				<AddBreedForm
					id={`${props.pet.id}-breed`}
					pet={props.pet}
					onDismiss={() => toggle((old) => ({ ...old, showBreed: false }))}
				/>
			</Match>
		</Switch>
	);
}
