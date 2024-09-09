import { Button, Icon, Text, mergeDefaultProps } from "@nou/ui";
import { Match, Show, Suspense, Switch, createSignal } from "solid-js";

import { createTranslator } from "~/server/i18n";

import { FamilyInviteBenefits } from "../family-invite-benefits";

import {
	MultiScreenPopover,
	MultiScreenPopoverContent,
	type MultiScreenPopoverControls,
	MultiScreenPopoverHeader,
} from "../multi-screen-popover";
import { FamilyInviteQRCode } from "./invite-qrcode";
import { InviteWaitlist } from "./invite-waitlist";
import { JoinFamily } from "./join-family";
import { Joined } from "./joined";

type Step = "initial" | "qrcode" | "waitlist" | "join" | "join-success";
export function FamilyInviteDialog(props: {
	id: string;
	initialScreen?: Step;
}) {
	return (
		<MultiScreenPopover
			id={props.id}
			// class="view-transition-[family-invite-dialog] mt-[16vh] flex w-[94svw] max-w-[420px] flex-col gap-6 bg-gradient-to-b from-surface via-65% via-surface to-primary/10 p-6 md:mt-[20vh]"
		>
			{(controls) => {
				return (
					<Suspense>
						<InviteDialogContent
							controls={controls}
							id={props.id}
							initialScreen={props.initialScreen}
						/>
					</Suspense>
				);
			}}
		</MultiScreenPopover>
	);
}

/**
 * The component is separated to ensure the `step` is reset after the dialog is closed.
 */
const InviteDialogContent = (ownProps: {
	id: string;
	initialScreen?: Step;
	controls: MultiScreenPopoverControls;
}) => {
	const t = createTranslator("family");
	const props = mergeDefaultProps(ownProps, { initialScreen: "initial" });
	const [step, setStep] = createSignal<Step>(props.initialScreen);
	const update = async (newStep: Step, direction: "forwards" | "backwards" = "forwards") => {
		props.controls.update(() => {
			setStep(newStep);
		}, direction);
	};
	return (
		<>
			<MultiScreenPopoverHeader
				id={props.id}
				backButton={
					<Show when={!new Set<Step>(["initial", "join-success"]).has(step())} fallback={<div />}>
						<Button
							variant="ghost"
							icon
							label={t("invite.back")}
							onClick={() => {
								switch (step()) {
									case "qrcode":
										return update("initial", "backwards");
									case "join":
										return update("initial", "backwards");
									case "waitlist":
										return update("qrcode", "backwards");
									default:
										return null;
								}
							}}
						>
							<Icon use="chevron-left" />
						</Button>
					</Show>
				}
				headline={
					<Switch>
						<Match when={step() === "initial"}>{t("invite.step-aria-initial")}</Match>
						<Match when={step() === "qrcode"}>{t("invite.step-aria-qrcode")}</Match>
						<Match when={step() === "waitlist"}>{t("invite.step-aria-waitlist")}</Match>
						<Match when={step() === "join"}>{t("invite.step-aria-join")}</Match>
						<Match when={step() === "join-success"}>{t("invite.step-aria-join-success")}</Match>
					</Switch>
				}
			/>
			<MultiScreenPopoverContent>
				<Switch>
					<Match when={step() === "initial"}>
						<div class="flex flex-col gap-6">
							<Text with="headline-2" as="h2">
								{t("invite.headline")}
							</Text>
							<Text as="p">{t("invite.subheadline")}</Text>
							<FamilyInviteBenefits class="-mx-6 scroll-px-6 px-6" />
						</div>
						<div class="flex flex-col gap-4">
							<Button variant="accent" onClick={() => update("qrcode")}>
								{t("invite.cta-invite")}
							</Button>
							<div class="self-center">
								<Button
									variant="link"
									onClick={() => {
										update("join");
									}}
								>
									{t("invite.join")}
								</Button>
							</div>
						</div>
					</Match>
					<Match when={step() === "qrcode"}>
						<FamilyInviteQRCode onNext={() => update("waitlist")} />
					</Match>
					<Match when={step() === "join"}>
						<JoinFamily
							onCancel={() => update("initial", "backwards")}
							onSuccess={() => update("join-success")}
						/>
					</Match>
					<Match when={step() === "waitlist"}>
						<InviteWaitlist onNext={props.controls.close} />
					</Match>
					<Match when={step() === "join-success"}>
						<Joined popoverTarget={props.id} />
					</Match>
				</Switch>
			</MultiScreenPopoverContent>
		</>
	);
};

export default FamilyInviteDialog;
