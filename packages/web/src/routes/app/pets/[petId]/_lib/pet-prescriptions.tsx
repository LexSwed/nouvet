import { Button, Card, Drawer, Icon, Text } from "@nou/ui";
import { type Accessor, For, Show } from "solid-js";
import { Temporal } from "temporal-polyfill";
import { PrescriptionActivityForm } from "~/lib/new-activity-creator/activity-types";
import { createFormattedDate } from "~/lib/utils/format-date";
import type { getPetScheduledActivities } from "~/server/api/activity";
import { createTranslator } from "~/server/i18n";
import type { SupportedLocale } from "~/server/i18n/shared";
import type { PetID } from "~/server/types";

type Activity = Awaited<ReturnType<typeof getPetScheduledActivities>>[number];

export type PrescriptionActivity = Activity & {
	type: "prescription";
	prescription: NonNullable<Activity["prescription"]>;
};

type Props = {
	petId: PetID;
	locale: SupportedLocale;
	activities: Accessor<PrescriptionActivity[]>;
};

export function PetPrescriptions(props: Props) {
	const t = createTranslator("pets");
	return (
		<section class="flex flex-col gap-2" aria-labelledby="pet-meds-heading">
			<Text as="h2" with="overline" id="pet-meds-heading">
				{t("meds.heading")}
			</Text>
			<div class="flex flex-row gap-2">
				<Card
					aria-hidden="true"
					variant="tonal"
					tone="secondary"
					class="flex flex-col items-center justify-center px-2"
				>
					<Icon
						use="pill"
						class="size-10 rounded-full bg-on-tertiary-container/10 p-2 text-current"
					/>
				</Card>
				<ul class="flex flex-1 flex-col gap-2">
					<For each={props.activities()}>
						{(activity) => {
							const drawerId = `prescription-${activity.id}`;
							return (
								<li class="contents">
									<Button
										popoverTarget={drawerId}
										class="flex-1 flex-row items-center gap-2 rounded-xl p-3"
										variant="tonal"
										tone="secondary"
									>
										<div class="flex flex-1 flex-col items-start gap-1">
											<div class="flex flex-row items-center gap-2">
												{activity.prescription.name}
											</div>
											<div class="flex flex-row items-center gap-2">
												<Show when={activity.prescription.endDate}>
													{(utc) => {
														const startDate = Temporal.ZonedDateTime.from(activity.date);
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
																() => endDate.toZonedDateTime(startDate.timeZoneId),
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
									<Drawer id={drawerId}>
										{(open) => (
											<Show when={open()}>
												<PrescriptionActivityForm
													id={drawerId}
													petId={props.petId}
													locale={props.locale}
													activity={{
														name: activity.prescription.name,
														note: activity.note,
														recordedDate: activity.date,
														endDate: activity.prescription.endDate,
														dateStarted: activity.prescription.dateStarted,
														dateCompleted: activity.prescription.dateCompleted,
														id: activity.id,
													}}
												/>
											</Show>
										)}
									</Drawer>
								</li>
							);
						}}
					</For>
				</ul>
			</div>
		</section>
	);
}
