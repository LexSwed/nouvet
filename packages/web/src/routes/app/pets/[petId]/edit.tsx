import {
	Button,
	ButtonLink,
	Card,
	Drawer,
	Form,
	Icon,
	Popover,
	Text,
	TextField,
	Toast,
	toast,
} from "@nou/ui";
import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
	useAction,
	useSubmission,
} from "@solidjs/router";
import { Show } from "solid-js";

import { AppHeader } from "~/lib/app-header";
import { PetPicture } from "~/lib/pet-home-card";
import { GenderSwitch } from "~/lib/species-selector";
import { isSubmissionFailure } from "~/lib/utils/submission";
import { getPetForEdit, updatePet } from "~/server/api/pet";
import { getUserProfile } from "~/server/api/user";
import type { DatabasePet } from "~/server/db/schema";
import { T, cacheTranslations, createTranslator } from "~/server/i18n";

export const route = {
	preload({ params }) {
		void cacheTranslations("pets");
		void getPetForEdit(params.petId!);
		void getUserProfile();
	},
} satisfies RouteDefinition;

export default function PetEditPage(props: RouteSectionProps) {
	const t = createTranslator("pets");
	const pet = createAsync(() => getPetForEdit(props.params.petId!));

	return (
		<>
			<Title>{t("meta.edit-title", { petName: pet()?.name ?? "" })}</Title>
			<AppHeader>
				<ButtonLink href={`/app/pets/${props.params.petId}`} variant="tonal">
					<Icon use="chevron-left" class="-ms-2" />
					<Text with="body-sm">{pet()?.name}</Text>
				</ButtonLink>
			</AppHeader>
			<div class="container flex flex-col items-center pb-24">
				<Show when={pet()}>
					{(pet) => (
						<div class="flex max-w-[420px] flex-col gap-4">
							<Card class="flex flex-col gap-8" variant="outlined">
								<Text
									with="headline-2"
									as="h2"
									class="font-normal [&_b]:font-semibold [&_b]:text-on-background"
									tone="light"
								>
									<T>{t("edit.headline", { petName: pet().name })}</T>
								</Text>
								<PetPictureWithUpload pet={pet()} />
								<PetUpdateForm petId={props.params.petId!} />
							</Card>
							<PetDeleteForm pet={pet()} />
						</div>
					)}
				</Show>
			</div>
		</>
	);
}

function PetPictureWithUpload(props: {
	pet: {
		name: string;
		pictureUrl: string | null;
		species: DatabasePet["species"];
		gender: DatabasePet["gender"];
	};
}) {
	const t = createTranslator("pets");

	return (
		<div class="flex flex-row items-center gap-2">
			<PetPicture pet={props.pet} class="h-32 w-full flex-1 rounded-2xl" />
			<Button variant="tonal" popoverTarget="pet-picture-upload">
				<Icon use="camera" />
				<Show
					when={props.pet.pictureUrl}
					children={t("edit.photo-update")}
					fallback={t("edit.photo-add")}
				/>
			</Button>
			<Popover
				heading={t("edit.photo-update-dialog-title", { petName: props.pet.name })}
				id="pet-picture-upload"
				placement="center"
				class="w-[calc(100%-theme(spacing.4))] max-w-[560px]"
			>
				Upload
			</Popover>
		</div>
	);
}

function PetUpdateForm(props: { petId: string }) {
	const pet = createAsync(() => getPetForEdit(props.petId!));
	const t = createTranslator("pets");
	const updateSubmission = useSubmission(updatePet);
	const updateAction = useAction(updatePet);

	return (
		<Show when={pet()}>
			{(pet) => (
				<Form
					class="flex flex-col gap-8"
					action={updatePet}
					validationErrors={
						isSubmissionFailure(updateSubmission, "validation")
							? updateSubmission.result.errors
							: null
					}
					onSubmit={async (e) => {
						e.preventDefault();
						try {
							const res = await updateAction(new FormData(e.currentTarget));
							if ("pet" in res) {
								toast(() => <Toast>{t("edit.saved-success", { petName: pet().name })}</Toast>);
							} else if (res.failureReason === "other") {
								toast(() => <Toast>{t("edit.saved-failure")}</Toast>);
							}
						} catch (error) {
							console.error(error);
						}
					}}
				>
					<input type="hidden" name="petId" value={pet().id} />
					<TextField
						name="name"
						label={t("edit.name")}
						value={pet().name}
						class="flex-[2]"
						required
					/>
					<GenderSwitch name="gender" value={pet().gender} />
					<TextField
						name="dateOfBirth"
						label={t("edit.birth-date")}
						autocomplete="off"
						type="date"
						value={pet().dateOfBirth ?? ""}
						min="2000-01-01"
						max={new Date().toISOString().split("T")[0]}
					/>
					<TextField label={t("edit.breed")} name="breed" value={pet().breed ?? ""} />
					<Button type="submit" loading={updateSubmission.pending}>
						{t("edit.save-cta")}
					</Button>
				</Form>
			)}
		</Show>
	);
}

function PetDeleteForm(props: { pet: { id: string; name: string } }) {
	const t = createTranslator("pets");
	return (
		<>
			<Button variant="ghost" tone="destructive" popoverTarget="pet-delete-form" class="mx-5">
				{t("edit.delete-cta")}
			</Button>
			<Drawer
				id="pet-delete-form"
				heading={t("delete.heading", { petName: props.pet.name })}
				placement="center"
			>
				{t("delete.text", { petName: props.pet.name })}
				<div class="mt-6 grid grid-cols-2 gap-4">
					<Button
						popoverTarget="pet-delete-form"
						popoverTargetAction="hide"
						variant="tonal"
						tone="neutral"
					>
						{t("delete.cancel")}
					</Button>
					<Button variant="tonal" tone="destructive">
						{t("delete.confirm")}
					</Button>
				</div>
			</Drawer>
		</>
	);
}
