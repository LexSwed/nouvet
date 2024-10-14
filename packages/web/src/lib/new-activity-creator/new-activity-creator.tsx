import { Button, Icon, Text } from "@nou/ui";
import { Match, Show, Switch, createSignal } from "solid-js";
import { createTranslator } from "~/server/i18n";
import type { SupportedLocale } from "~/server/i18n/shared";
import type { ActivityType, PetID } from "~/server/types";
import {
	MultiScreenPopover,
	MultiScreenPopoverContent,
	MultiScreenPopoverHeader,
} from "../multi-screen-popover";
import {
	AppointmentActivityForm,
	ObservationActivityForm,
	PrescriptionActivityForm,
	VaccinationActivityForm,
} from "./activity-types";

type Step = ActivityType | "type-select";

export function NewActivityCreator(props: {
	id: string;
	locale: SupportedLocale;
	defaultType?: Step;
	petId: PetID;
}) {
	return (
		<MultiScreenPopover id={props.id} component="drawer" class="md:min-w-[420px]">
			{(controls) => {
				const t = createTranslator("pets");
				const [step, setStep] = createSignal<Step>(props.defaultType ?? "type-select");
				const update = async (newStep: Step, direction: "forwards" | "backwards" = "forwards") => {
					controls.update(async () => {
						setStep(newStep);
					}, direction);
				};

				return (
					<>
						<MultiScreenPopoverHeader class="mb-4 justify-between">
							<Show when={step() !== "type-select"} fallback={<div />}>
								<Button
									variant="ghost"
									icon
									label={t("new-activity.back-button")}
									onClick={() => update("type-select", "backwards")}
								>
									<Icon use="chevron-left" />
								</Button>
							</Show>

							<Switch>
								<Match when={step() === "type-select"}>
									<>
										<Text class="mt-4" with="label">
											{t("new-activity.heading-main")}
										</Text>
										<div />
									</>
								</Match>
								<Match when={step() === "observation"}>
									<>
										<Text with="label">{t("new-activity.heading-observation")}</Text>
										<Icon
											use="note"
											class="m-2 size-10 rounded-full bg-primary/8 p-2 text-primary"
										/>
									</>
								</Match>
								<Match when={step() === "appointment"}>
									<>
										<Text with="label">{t("new-activity.heading-appointment")}</Text>
										<Icon
											use="first-aid"
											class="m-2 size-10 rounded-full bg-primary/8 p-2 text-primary"
										/>
									</>
								</Match>
								<Match when={step() === "prescription"}>
									<>
										<Text with="label">{t("new-activity.heading-prescription")}</Text>
										<Icon
											use="pill"
											class="m-2 size-10 rounded-full bg-primary/8 p-2 text-primary"
										/>
									</>
								</Match>
								<Match when={step() === "vaccination"}>
									<>
										<Text with="label">{t("new-activity.heading-vaccination")}</Text>
										<Icon
											use="syringe"
											class="m-2 size-10 rounded-full bg-primary/8 p-2 text-primary"
										/>
									</>
								</Match>
							</Switch>
						</MultiScreenPopoverHeader>
						<MultiScreenPopoverContent>
							<Switch>
								<Match when={step() === "type-select"}>
									<ActivitySelection update={update} />
								</Match>
								<Match when={step() === "observation"}>
									<ObservationActivityForm {...props} activity={null} />
								</Match>
								<Match when={step() === "appointment"}>
									<AppointmentActivityForm {...props} activity={null} />
								</Match>
								<Match when={step() === "prescription"}>
									<PrescriptionActivityForm {...props} activity={null} />
								</Match>
								<Match when={step() === "vaccination"}>
									<VaccinationActivityForm {...props} activity={null} />
								</Match>
							</Switch>
						</MultiScreenPopoverContent>
					</>
				);
			}}
		</MultiScreenPopover>
	);
}

export function ActivitySelection(props: {
	update: (newStep: Step) => void;
	popoverTarget?: string;
}) {
	const t = createTranslator("pets");
	return (
		<div class="grid grid-cols-2 gap-3">
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl intent:bg-primary-container p-3 intent:text-on-primary-container"
				onClick={() => props.update("observation")}
				popoverTarget={props.popoverTarget}
			>
				<Icon use="note" class="size-10 rounded-full bg-[lch(from_currentColor_l_c_h/8%)] p-2" />
				<Text>{t("new-activity.type-observation")}</Text>
			</Button>
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl intent:bg-primary-container p-3 intent:text-on-primary-container"
				onClick={() => props.update("appointment")}
				popoverTarget={props.popoverTarget}
			>
				<Icon
					use="first-aid"
					class="size-10 rounded-full bg-[lch(from_currentColor_l_c_h/8%)] p-2"
				/>
				<Text>{t("new-activity.type-appointment")}</Text>
			</Button>
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl intent:bg-primary-container p-3 intent:text-on-primary-container"
				onClick={() => props.update("prescription")}
				popoverTarget={props.popoverTarget}
			>
				<Icon use="pill" class="size-10 rounded-full bg-[lch(from_currentColor_l_c_h/8%)] p-2" />
				<Text>{t("new-activity.type-prescription")}</Text>
			</Button>
			<Button
				class="flex flex-col items-start gap-3 rounded-2xl intent:bg-primary-container p-3 intent:text-on-primary-container"
				onClick={() => props.update("vaccination")}
				popoverTarget={props.popoverTarget}
			>
				<Icon use="syringe" class="size-10 rounded-full bg-[lch(from_currentColor_l_c_h/8%)] p-2" />
				<Text>{t("new-activity.type-vaccination")}</Text>
			</Button>
		</div>
	);
}
