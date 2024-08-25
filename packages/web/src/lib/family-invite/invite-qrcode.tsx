import { Button, Card, Spinner, Text, tw } from "@nou/ui";
import { createAsync } from "@solidjs/router";
import { Suspense, createEffect, createSignal } from "solid-js";
import type QRCodeStyling from "styled-qr-code";

import { getFamilyInvite } from "~/server/api/family-invite";
import { createTranslator } from "~/server/i18n";

import { createPersistedSetting } from "../utils/make-persisted-signal";

export const FamilyInviteQRCode = (props: { onNext: () => void }) => {
	const t = createTranslator("family");
	// TODO: error handling when the invite could not be generated
	const inviteData = createAsync(() => getFamilyInvite());
	const [containerRef, setContainerRef] = createSignal<HTMLDivElement | null>(null);
	const [consentShown, setConsentShown] = createPersistedSetting<boolean>(
		"qr-code-invitation-consent",
		true,
		{ maxAgeInDays: 1 },
	);
	const invite = () => {
		const inviteInfo = inviteData();
		return inviteInfo && "failureReason" in inviteInfo ? null : inviteInfo;
	};

	async function share() {
		const shareData = {
			url: invite()?.url,
			title: t("invite.invite-share-title-no-name"),
			text: t("invite.invite-share-text"),
		} satisfies ShareData;
		await navigator.share(shareData);
	}

	let qrCode: QRCodeStyling;
	createEffect(() => {
		const data = invite()?.qrString;
		const container = containerRef();
		if (data && container) {
			// show fake QR code on the background while the consent is shown
			const content = consentShown() ? "0" : data;
			if (qrCode) {
				qrCode.update({ data: content });
			} else {
				createQRCode(content, container).then((instance) => {
					qrCode = instance;
				});
			}
		}
	});

	return (
		<div class="flex flex-col gap-6">
			<div class="flex size-full flex-col items-center justify-center gap-3">
				<Text
					as="p"
					class={tw(
						"text-balance text-center",
						consentShown() ? "opacity-0" : "transition-opacity delay-300 duration-300",
					)}
					aria-hidden={!!consentShown()}
				>
					{t("invite.qr-description")}
				</Text>
				<div class="stack size-[300px] shrink-0">
					<div
						class={tw(
							"stack size-[300px] transition-transform duration-500 ease-out",
							consentShown() ? "scale-[0.98]" : "scale-100",
						)}
					>
						<div ref={setContainerRef} class="peer" />
						<div class="hidden size-full animate-pulse place-content-center rounded-2xl bg-tertiary/12 peer-empty:grid">
							<Spinner size="sm" />
						</div>
					</div>
					<Card
						class={tw(
							"allow-discrete flex size-full flex-col items-center justify-center gap-4 bg-surface/[0.975] backdrop-blur-sm transition-all duration-150",
							!consentShown() ? "hidden scale-[0.98] opacity-0" : undefined,
						)}
						variant="outlined"
					>
						<Text as="p" with="body">
							{t("invite.info-consent")}
						</Text>
						<Button
							size="sm"
							variant="link"
							onClick={() => {
								setConsentShown(false);
							}}
						>
							{t("invite.info-consent-accept")}
						</Button>
					</Card>
				</div>
				<Suspense fallback={<div class="h-5" />}>
					<Text
						with="body-sm"
						tone="light"
						class={consentShown() ? "opacity-0" : "transition-opacity delay-500 duration-300"}
						aria-hidden={consentShown()}
					>
						{t("invite.expires-in", {
							expiresIn: invite()?.expiresIn || "",
						})}
					</Text>
				</Suspense>
			</div>
			<div class="flex flex-col gap-4">
				<Button onClick={props.onNext}>{t("invite.cta-ready")}</Button>
				<Button variant="link" onClick={share}>
					{t("invite.cta-share")}
				</Button>
			</div>
		</div>
	);
};

async function createQRCode(data: string, containerRef: HTMLDivElement) {
	const QRCodeStyling = await import("styled-qr-code").then((bundle) => bundle.default);
	const qrImage = new QRCodeStyling({
		data,
		width: 300,
		height: 300,
		type: "svg",
		image: "/icons/icon.svg",
		dotsOptions: {
			color: "var(--nou-on-surface)",
			type: "rounded",
		},
		cornersSquareOptions: {
			color: "var(--nou-on-surface)",
			type: "extra-rounded",
		},
		backgroundOptions: {
			color: "#ffffff00",
		},
		imageOptions: {
			crossOrigin: "anonymous",
			margin: 0,
		},
	});
	qrImage.append(containerRef);
	return qrImage;
}
