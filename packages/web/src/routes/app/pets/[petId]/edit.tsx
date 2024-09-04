import { Button, Card, Form, Icon, Popover, Text, TextField, Toast, toast } from "@nou/ui";
import { Title } from "@solidjs/meta";
import {
	type RouteDefinition,
	type RouteSectionProps,
	createAsync,
	redirect,
	useAction,
	useNavigate,
	useSubmission,
} from "@solidjs/router";
import { Show } from "solid-js";

import { PetPicture } from "~/lib/pet-home-card";
import { GenderSwitch } from "~/lib/species-selector";
import { isSubmissionValidationError } from "~/lib/utils/submission";
import { deletePet, getPet, updatePet } from "~/server/api/pet";
import type { DatabasePet } from "~/server/db/schema";
import { T, cacheTranslations, createTranslator } from "~/server/i18n";
import type { PetGender, PetID, PetSpecies } from "~/server/types";

export const route = {
	preload({ params }) {
		void cacheTranslations("pets");
		void getPet(params.petId as PetID);
	},
} satisfies RouteDefinition;

export default function PetEditPage(props: RouteSectionProps) {
	const t = createTranslator("pets");
	const pet = createAsync(() => getPet(props.params.petId as PetID));

	return (
		<>
			<Title>{t("meta.edit-title", { petName: pet()?.name ?? "" })}</Title>
			<div class="container flex flex-col items-center pb-24">
				<Show when={pet()}>
					{(pet) => (
						<div class="flex max-w-[420px] flex-col gap-4">
							<Card class="flex flex-col gap-8" variant="outlined">
								<Text
									with="headline-3"
									as="h2"
									class="font-normal [&_b]:font-semibold [&_b]:text-on-background"
									tone="light"
								>
									<T>{t("edit.headline", { petName: pet().name })}</T>
								</Text>
								<PetPictureWithUpload pet={pet()} />
								<PetUpdateForm petId={props.params.petId as PetID} />
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
		species: PetSpecies;
		gender: PetGender;
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

function PetUpdateForm(props: { petId: PetID }) {
	const pet = createAsync(() => getPet(props.petId!));
	const t = createTranslator("pets");
	const updateSubmission = useSubmission(updatePet);
	const updateAction = useAction(updatePet);
	const navigate = useNavigate();

	return (
		<Show when={pet()}>
			{(pet) => (
				<Form
					class="flex flex-col gap-8"
					action={updatePet}
					validationErrors={
						isSubmissionValidationError(updateSubmission) ? updateSubmission.result.errors : null
					}
					onSubmit={async (e) => {
						e.preventDefault();
						try {
							const res = await updateAction(new FormData(e.currentTarget));
							if ("pet" in res) {
								toast(() => <Toast>{t("edit.update-success", { petName: pet().name })}</Toast>);
								navigate(`/app/pets/${pet().id}`);
							} else if (res.failureReason === "other") {
								toast(() => <Toast>{t("edit.update-failure")}</Toast>);
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
					<Button type="submit" pending={updateSubmission.pending}>
						{t("edit.save-cta")}
					</Button>
				</Form>
			)}
		</Show>
	);
}

function PetDeleteForm(props: {
	pet: {
		id: DatabasePet["id"];
		name: DatabasePet["name"];
		pictureUrl: DatabasePet["pictureUrl"];
		gender: DatabasePet["gender"];
		species: DatabasePet["species"];
	};
}) {
	const t = createTranslator("pets");
	const deleteAction = useAction(deletePet);
	const deleteSubmission = useSubmission(deletePet);
	return (
		<>
			<Button variant="ghost" tone="destructive" popoverTarget="pet-delete-form" class="mx-5">
				{t("edit.delete-cta")}
			</Button>
			<Popover
				id="pet-delete-form"
				placement="bottom-to-bottom"
				class={"-mb-2 max-w-[anchor-size(width)] backdrop:bg-on-surface/5"}
			>
				<Form
					class="flex flex-col justify-end gap-4"
					action={deletePet}
					onSubmit={async (e) => {
						e.preventDefault();
						const res = await deleteAction(new FormData(e.currentTarget));
						if ("petId" in res) {
							toast(() => <Toast>{t("delete.success", { petName: props.pet.name })}</Toast>);
							return redirect("/app/pets");
						}
						toast(() => (
							<Toast tone="failure">{t("delete.failure", { petName: props.pet.name })}</Toast>
						));
					}}
				>
					<input type="hidden" name="petId" value={props.pet.id} />
					<PetPicture pet={props.pet} class="size-10 bg-error-container text-on-error-container" />
					<Text with="headline-3" as="header">
						{t("delete.heading", { petName: props.pet.name })}
					</Text>
					<p>{t("delete.text", { petName: props.pet.name })}</p>
					<div class="mt-6 grid grid-cols-2 gap-4">
						<Button
							popoverTarget="pet-delete-form"
							popoverTargetAction="hide"
							variant="tonal"
							tone="neutral"
						>
							{t("delete.cancel")}
						</Button>
						<Button
							variant="tonal"
							type="submit"
							tone="destructive"
							pending={deleteSubmission.pending}
						>
							{t("delete.confirm")}
						</Button>
					</div>
				</Form>
			</Popover>
		</>
	);
}
