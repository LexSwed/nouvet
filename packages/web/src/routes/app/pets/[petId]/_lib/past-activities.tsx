import { Card, Icon, Text } from "@nou/ui";
import { type Accessor, For, Show } from "solid-js";
import type { listAllPetActivities } from "~/server/api/activity";

export function PetPastActivities(props: {
	activities: Accessor<Awaited<ReturnType<typeof listAllPetActivities>>>;
}) {
	// TODO: empty results, cursor pagination, current date highlight

	return (
		<Show when={props.activities().activities}>
			{(yearActivities) => {
				return (
					<Card class="flex flex-col gap-6" aria-labelledby="pet-activities-headline">
						<Text as="h3" with="headline-3" id="pet-activities-headline">
							Past activities
						</Text>
						<div class="grid grid-cols-[auto,1fr] gap-4">
							<For each={yearActivities()}>
								{([year, dateEntries]) => (
									<section class="contents">
										<header class="col-span-2">
											<Text
												with="overline"
												tone="light"
												class="rounded-md bg-on-surface/3 p-1 tabular-nums"
											>
												{year}
											</Text>
										</header>
										<ul class="contents">
											<For each={dateEntries}>
												{([date, activities]) => {
													return (
														<li class="contents">
															<Text with="overline" class="sticky top-2 text-end tabular-nums">
																{date}
															</Text>
															<ul class="flex flex-1 flex-col gap-6 rounded-2xl bg-tertiary/5 p-3">
																<For each={activities}>
																	{(activity) => (
																		<li class="flex flex-row items-center gap-2">
																			<Icon
																				use="note"
																				class="size-10 rounded-full bg-yellow-100 p-2 text-yellow-950"
																			/>
																			<div class="flex flex-1 flex-col gap-2">
																				<div class="flex flex-row items-center justify-between gap-4">
																					<Text with="body-xs">{activity.type}</Text>
																					<Text with="body-xs" tone="light">
																						{activity.time}
																					</Text>
																				</div>
																			</div>
																		</li>
																	)}
																</For>
															</ul>
														</li>
													);
												}}
											</For>
										</ul>
									</section>
								)}
							</For>
						</div>
					</Card>
				);
			}}
		</Show>
	);
}
