import { Button, Icon, Spinner, Text } from "@nou/ui";
import { useAction, useSubmission } from "@solidjs/router";
import QrScanner from "qr-scanner";
import { Match, Show, Switch, createEffect, createSignal, onCleanup } from "solid-js";

import { joinFamilyWithQRCode } from "~/server/api/family-invite";
import { createTranslator } from "~/server/i18n";

import { startViewTransition } from "../utils/start-view-transition";

const QRCodeScannerPage = (props: { onSuccess: () => void }) => {
	const t = createTranslator("family");
	const join = useAction(joinFamilyWithQRCode);
	const joinSubmission = useSubmission(joinFamilyWithQRCode);
	const [imageData, setImageData] = createSignal<string | null>(null);

	const onScanSuccess = async (inviteCode: string, imageData: string) => {
		try {
			setImageData(imageData);
			const res = await join(inviteCode);
			if ("familyId" in res) {
				startViewTransition(() => {
					props.onSuccess();
				});
			}
		} catch (error) {
			console.log("error", error);
		}
	};

	onCleanup(() => {
		joinSubmission.clear?.();
	});

	return (
		<Switch>
			<Match when={joinSubmission.error}>
				<div class="stack">
					<Show when={imageData()}>
						{(src) => (
							<div class="fade-in size-full animate-in rounded-2xl fill-mode-both blur-sm duration-300 [clip-path:border-box]">
								<img
									src={src()}
									alt=""
									class="-scale-x-100 h-full rounded-2xl object-cover object-center"
								/>
							</div>
						)}
					</Show>
					<div class="zoom-in-95 fade-in flex size-full animate-in flex-col items-center justify-center gap-8 rounded-2xl bg-surface/90 fill-mode-both p-4 duration-300">
						<Text with="label-lg" class="text-balance text-center">
							{t("invite.expired-heading")}
						</Text>
						<Text class="text-balance text-center">{t("invite.expired-description")}</Text>
						<Button variant="outline" onClick={() => joinSubmission.clear()} class="gap-2">
							<Icon use="arrows-clockwise" />
							{t("invite.expired-cta")}
						</Button>
					</div>
				</div>
			</Match>
			<Match when={joinSubmission.pending}>
				<div class="grid size-full place-content-center">
					<Spinner size="base" />
				</div>
			</Match>
			<Match when={!joinSubmission.pending && !joinSubmission.error}>
				<div class="size-[300px] rounded-2xl bg-on-surface/5 empty:animate-pulse">
					<QRCodeScanner onSuccess={onScanSuccess} />
				</div>
			</Match>
		</Switch>
	);
};

export default QRCodeScannerPage;

const QRCodeScanner = (props: {
	/**
	 * A callback that's executed when a valid URL is recognized.
	 */
	onSuccess: (url: string, image: string) => void;
}) => {
	const [videoEl, setVideoElement] = createSignal<HTMLVideoElement | null>(null);
	let canvas: HTMLCanvasElement | null = null;

	createEffect(() => {
		const ref = videoEl();
		if (!ref) return;

		const qrScanner = new QrScanner(
			ref,
			(result) => {
				if (result.data) {
					props.onSuccess(result.data, qrScanner.$canvas.toDataURL());
				}
			},
			{
				preferredCamera: "environment",
				maxScansPerSecond: 5,
				onDecodeError: () => null,
			},
		);
		qrScanner.start();
		onCleanup(() => {
			qrScanner.stop();
			qrScanner.destroy();
		});
	});

	return (
		<div class="stack">
			<canvas
				ref={(el) => {
					canvas = el;
				}}
				class="size-[300px] rounded-2xl"
			/>
			{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
			<video ref={setVideoElement} class="size-[300px] rounded-2xl object-cover" />
		</div>
	);
};
