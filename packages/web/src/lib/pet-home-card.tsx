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
	tw,
} from "@nou/ui";
import { A, useLocation } from "@solidjs/router";
import { ErrorBoundary, Match, Show, Suspense, Switch, createUniqueId } from "solid-js";

import { createTranslator } from "~/server/i18n";

import { createPersistedSetting } from "~/lib/utils/make-persisted-signal";

import type { PetGender, PetSpecies, UserID } from "~/server/types";
import AddBirthDateForm from "./add-birthdate-form";
import AddBreedForm from "./add-pet-breed";
import AddWeightForm from "./add-weight-form";

interface PetHomeCardProps {
	pet: {
		id: string;
		pictureUrl: string | null;
		name: string;
		species: PetSpecies;
		gender: PetGender;
		breed: string | null;
		dateOfBirth: string | null;
		color: string | null;
		weight: number | null;
	};
	/**
	 * The actual owner of the pet. If the user is not the owner, this should be `null`.
	 */
	actualOwner:
		| {
				id: UserID;
				name: string | null | undefined;
				avatarUrl: string | null | undefined;
		  }
		| undefined
		| null;
}

const petIconMap: Record<PetSpecies, SvgIcons> = {
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
	const location = useLocation();

	return (
		<Card
			class="flex min-w-52 flex-col gap-4 rounded-2xl p-0.5"
			variant="flat"
			ref={(el: HTMLElement) => {
				triggerRef = el;
			}}
		>
			<Button
				variant="ghost"
				class="flex h-auto cursor-pointer flex-row items-center justify-start gap-4 rounded-[0.875rem] p-3 pb-4"
				popoverTarget={petPopoverId}
				id={`pet-${props.pet.id}`}
			>
				<PetPicture pet={props.pet} />
				<Text with="body-lg">{props.pet.name}</Text>
				<Show when={props.actualOwner}>
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
					<Show when={!props.actualOwner && hasMissingInfo()}>
						<Suspense fallback={null}>
							<QuickSetters pet={props.pet} />
						</Suspense>
					</Show>
				</div>
			</ErrorBoundary>
			<Popover
				id={petPopoverId}
				placement="top-to-top left-to-left"
				class="-m-2 flex transform-none flex-col gap-4 p-2"
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
					href={`/app/pets/${props.pet.id}`}
					class="group/link -outline-offset-4 -mb-2 flex flex-row items-center gap-4 rounded-[inherit] intent:bg-on-surface/5 p-3 outline-on-surface transition-colors duration-200 focus:outline-4"
				>
					<PetPicture pet={props.pet} />
					<Text with="body-lg">{props.pet.name}</Text>
					<Text class="sr-only">{t("go-to-pet-page", { petName: props.pet.name })}</Text>
					<Icon use="arrow-up-right" class="ms-auto" size="sm" />
				</A>
				<MenuList class="min-w-56">
					<Switch>
						<Match when={props.actualOwner}>
							{(owner) => (
								<MenuItem as={A} href={`/app/family/${owner().id}/`}>
									<Avatar avatarUrl={owner().avatarUrl || ""} name={owner().name || ""} size="xs" />
									<Text>{owner().name || t("pet-owner-no-name")}</Text>
								</MenuItem>
							)}
						</Match>
						<Match when={!props.actualOwner}>
							<MenuItem
								as={A}
								href={`/app/pets/${props.pet.id}/edit`}
								state={{ previous: location.pathname }}
							>
								<Icon use="pencil" size="sm" />
								{t("pet-menu.edit-info")}
							</MenuItem>
						</Match>
					</Switch>
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

export function PetPicture(props: {
	pet: {
		pictureUrl?: string | null;
		gender: PetGender;
		species: PetSpecies;
	};
	class?: string;
}) {
	return (
		<div
			class={tw(
				"flex size-16 shrink-0 items-center justify-center rounded-full",
				props.pet.gender && props.pet.gender === "female"
					? "bg-primary/10 text-primary"
					: "bg-tertiary/10 text-tertiary",
				props.class,
			)}
		>
			<Show
				when={props.pet.pictureUrl}
				children={(picture) => <img src={picture()} class="aspect-square w-full" alt="" />}
				fallback={<Icon use={petIconMap[props.pet.species]} class="size-[50%]" />}
			/>
		</div>
	);
}

export function QuickSetters(props: { pet: PetHomeCardProps["pet"] }) {
	const t = createTranslator("pets");

	const [qs, toggle] = createPersistedSetting(`qs-toggles-${props.pet.id}`, {
		showBirthDate: !props.pet.dateOfBirth,
		showWeight: !props.pet.weight,
		showBreed: !props.pet.breed,
	});

	return (
		<Switch>
			<Match when={qs()?.showBirthDate}>
				<SplitButton
					variant="tonal"
					class="max-w-48 gap-1 outline outline-4 outline-surface outline-offset-0"
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
					variant="tonal"
					class="max-w-48 gap-1 outline outline-4 outline-surface outline-offset-0"
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
					variant="tonal"
					class="max-w-48 gap-1 outline outline-4 outline-surface outline-offset-0"
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
