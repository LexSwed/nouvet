import { Button, Card, Icon, Text } from "@nou/ui";
import { type Accessor, For, Show } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { createFormattedDate } from "~/lib/utils/format-date";
import type { getPetScheduledActivities } from "~/server/api/activity";
import { createTranslator } from "~/server/i18n";
import type { SupportedLocale } from "~/server/i18n/shared";

type Activity = Awaited<ReturnType<typeof getPetScheduledActivities>>[number];

export type PrescriptionActivity = Activity & {
	type: "prescription";
	prescription: NonNullable<Activity["prescription"]>;
};

type Props = {
	locale: SupportedLocale;
	activities: Accessor<PrescriptionActivity[]>;
};

export function PetPrescriptions(props: Props) {
	const t = createTranslator("pets");
	return (
		<section class="flex flex-col gap-2" aria-labelledby="pet-meds-heading">
			<Text as="h2" with="overline">
				{t("meds.heading")}
			</Text>
			<div class="flex flex-row gap-2">
				<Card
					as="header"
					variant="tonal"
					tone="secondary"
					class="flex flex-col items-center justify-center"
					id="pet-meds-heading"
				>
					<Icon
						use="pill"
						class="size-10 rounded-full bg-on-tertiary-container/10 p-2 text-current"
					/>
				</Card>
				<Card class="flex flex-1 flex-col gap-4" variant="tonal" tone="secondary">
					<ul class="contents">
						<For each={props.activities()}>
							{(activity) => (
								<li class="contents">
									<Button
										popoverTarget={`prescription-${activity.id}`}
										class="-m-2 flex-1 flex-row items-center gap-2 rounded-xl p-2"
										variant="ghost"
									>
										<div class="flex flex-1 flex-col items-start gap-1">
											<div class="flex flex-row items-center gap-2">
												{activity.prescription.name}
											</div>
											<div class="flex flex-row items-center gap-2">
												<Show when={activity.prescription.endDate}>
													{(utc) => {
														const endDate = Temporal.PlainDate.from(utc());
														const now = Temporal.Now.plainDateISO();
														const diff = now.until(endDate, {
															smallestUnit: "day",
															largestUnit: "year",
														});
														const formatter = new Intl.RelativeTimeFormat(props.locale, {});
														if (diff.years > 0) {
															return (
																<Text
																	with="body-xs"
																	tone="light"
																	as="time"
																	datetime={utc()}
																	title={endDate.toLocaleString()}
																>
																	{formatter.format(diff.years, "years")}
																</Text>
															);
														}
														if (diff.months > 0) {
															return (
																<Text
																	with="body-xs"
																	tone="light"
																	as="time"
																	datetime={utc()}
																	title={endDate.toLocaleString()}
																>
																	{formatter.format(diff.months, "months")}
																</Text>
															);
														}
														if (diff.days > 0) {
															return (
																<Text
																	with="body-xs"
																	tone="light"
																	as="time"
																	datetime={utc()}
																	title={endDate.toLocaleString()}
																>
																	{formatter.format(diff.days, "days")}
																</Text>
															);
														}
														if (diff.days < 0) {
															const date = createFormattedDate(
																() => new Date(utc()),
																() => props.locale,
																{ hour: null },
															);
															return (
																<Text
																	with="body-xs"
																	tone="light"
																	as="time"
																	datetime={utc()}
																	title={endDate.toLocaleString()}
																>
																	{t("meds.ended", { endDate: date()! })}
																</Text>
															);
														}
													}}
												</Show>
											</div>
										</div>
										<div>
											<Icon use="dot" size="md" />
										</div>
									</Button>
								</li>
							)}
						</For>
					</ul>
				</Card>
			</div>
		</section>
	);
}
