import { Button, ButtonLink, Card, Icon, Option, Picker, Text, TextField } from "@nou/ui";
import { Title } from "@solidjs/meta";
import { type RouteDefinition, type RouteSectionProps, createAsync } from "@solidjs/router";
import { For } from "solid-js";
import { Show, createMemo } from "solid-js";

import { AppHeader } from "~/lib/app-header";
import { PetPicture } from "~/lib/pet-home-card";
import { GenderSwitch } from "~/lib/species-selector";
import { getPetForEdit } from "~/server/api/pet";
import { getUser, getUserProfile } from "~/server/api/user";
import { T, cacheTranslations, createTranslator } from "~/server/i18n";

export const route = {
	preload({ params }) {
		void cacheTranslations("pets");
		void getPetForEdit(params.petId!);
		void getUserProfile();
	},
} satisfies RouteDefinition;

const PetEditPage = (props: RouteSectionProps) => {
	const t = createTranslator("pets");
	const pet = createAsync(() => getPetForEdit(props.params.petId!));
	const user = createAsync(() => getUser());

	const monthNames = createMemo(() => {
		const u = user();
		if (!u) return [];

		const formatter = Intl.DateTimeFormat(u.locale, {
			month: "long",
		});

		return Array.from({ length: 12 }).map((_, month) => {
			const date = new Date();
			date.setMonth(month, 1);
			return formatter.format(date);
		});
	});

	return (
		<>
			<Title>{t("meta.edit-title", { petName: pet()?.name ?? "" })}</Title>
			<AppHeader>
				<ButtonLink href={`/app/pets/${props.params.petId}`} variant="tonal">
					<Icon use="chevron-left" class="-ms-2" />
					<Text with="body-sm">{pet()?.name}</Text>
				</ButtonLink>
			</AppHeader>
			<div class="container flex flex-col gap-12">
				<Show when={pet()}>
					{(pet) => (
						<>
							<Card variant="flat" class="flex flex-col gap-8">
								<Text
									with="headline-2"
									as="h2"
									class="font-normal [&_b]:font-semibold [&_b]:text-on-background"
									tone="light"
								>
									<T>{t("edit.headline", { petName: pet().name })}</T>
								</Text>
								<div class="flex flex-row items-center gap-2">
									<PetPicture pet={pet()} class="h-32 w-48 rounded-2xl" />
									<Button variant="tonal">
										<Icon use="camera" /> Update
									</Button>
								</div>
								<TextField label="Name" as="textarea" class="flex-[2]">
									{pet().name}
								</TextField>
								<GenderSwitch name="gender" value={pet().gender} />
								<fieldset>
									<Text as="legend" with="label-sm" class="mb-2 inline-block">
										Birth date
									</Text>
									<div class="flex flex-row gap-2">
										<TextField
											name="bday"
											label="Day"
											autocomplete="off"
											type="number"
											min="1"
											max="31"
											class="flex-1"
										/>
										<Picker label="Month" name="bmonth" autocomplete="off" class="flex-[2]">
											<Option value="" label="None" />
											<For each={monthNames()}>
												{(month, index) => <Option value={index() + 1} label={month} />}
											</For>
										</Picker>
										<TextField
											name="byear"
											label="Year"
											autocomplete="off"
											type="number"
											min="1990"
											max={new Date().getFullYear()}
											class="flex-1"
										/>
									</div>
								</fieldset>
								<TextField label="Breed" name="breed" value={pet().breed ?? ""} />
								<TextField
									label="Identity code (REIAC)"
									name="breed"
									value={pet().identityCode ?? ""}
								/>
								<Button>Save</Button>
							</Card>
							<Button variant="ghost" tone="destructive">
								{t("edit.delete-cta", { petName: pet().name })}
							</Button>
						</>
					)}
				</Show>
			</div>
		</>
	);
};

export default PetEditPage;
