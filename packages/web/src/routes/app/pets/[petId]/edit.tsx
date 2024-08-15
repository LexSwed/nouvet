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
							<Card class="flex max-w-[420px] flex-col gap-8">
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
										<Icon use="camera" /> {t("edit.photo-update")}
									</Button>
								</div>
								<form class="flex flex-col gap-8">
									<TextField label={t("edit.name")} value={pet().name} class="flex-[2]" required />
									<GenderSwitch name="gender" value={pet().gender} />
									<fieldset>
										<Text as="legend" with="label-sm" class="mb-2 inline-block">
											{t("edit.birth-date")}
										</Text>
										<div class="flex flex-row gap-2">
											<TextField
												name="bday"
												label={t("edit.birth-day")}
												autocomplete="off"
												type="number"
												min="1"
												max="31"
												class="flex-1"
											/>
											<Picker
												label={t("edit.birth-month")}
												name="bmonth"
												autocomplete="off"
												class="flex-[2]"
											>
												<Option value="" label={t("edit.birth-month-none")} />
												<For each={monthNames()}>
													{(month, index) => <Option value={index() + 1} label={month} />}
												</For>
											</Picker>
											<TextField
												name="byear"
												label={t("edit.birth-year")}
												autocomplete="off"
												type="number"
												min="1990"
												max={new Date().getFullYear()}
												class="flex-1"
											/>
										</div>
									</fieldset>
									<TextField label={t("edit.breed")} name="breed" value={pet().breed ?? ""} />
									<Button type="submit">{t("edit.save-cta")}</Button>
								</form>
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
