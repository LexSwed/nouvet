import { Button, Icon, Text } from "@nou/ui";
import { createPermission } from "@solid-primitives/permission";
import { createAsync } from "@solidjs/router";
import { Match, Show, Suspense, Switch, createUniqueId, lazy } from "solid-js";

import { createTranslator } from "~/server/i18n";

const QRCodeScanner = lazy(() => import("./qr-scanner"));
export function JoinFamily(props: { onCancel: () => void; onSuccess: () => void }) {
	const t = createTranslator("family");

	const supportsCamera = createAsync(async () => {
		try {
			const devices = await navigator.mediaDevices?.enumerateDevices();
			return devices?.some((device) => device.kind === "videoinput");
		} catch {
			return false;
		}
	});
	const camera = createPermission("camera");
	const disabledId = createUniqueId();
	// we can do this only because we know it's not SSRed
	const orText = new Intl.ListFormat(navigator.language, {
		style: "short",
		type: "disjunction",
	})
		.format(["a", "b"])
		.split(" ")
		.at(1);

	return (
		<div class="-mt-8 flex flex-col items-center gap-6">
			<div class="grid size-20 shrink-0 place-content-center self-center rounded-full bg-on-surface/5">
				<Icon use="qr-code" size="md" />
			</div>
			<Text class="text-balance text-center">{t("invite.join-instruction")}</Text>
			<Switch>
				<Match when={camera() === "denied"}>
					<div class="flex flex-col items-center gap-2">
						<Button aria-disabled={true} aria-describedby={disabledId}>
							{t("invite.join-scan-cta")}
						</Button>
						<Text
							tone="light"
							as="label"
							id={disabledId}
							with="body-xs"
							class="text-balance text-center"
						>
							{t("invite.scan-denied")}
						</Text>
					</div>
				</Match>
				<Match when={camera() === "granted"}>
					<div class="size-[300px] rounded-2xl border border-on-surface/5 bg-on-surface/5 empty:animate-pulse">
						<Suspense>
							<QRCodeScanner onSuccess={props.onSuccess} />
						</Suspense>
					</div>
				</Match>
				<Match when={camera() !== "granted"}>
					<div class="flex flex-col items-center gap-4">
						<Show when={supportsCamera()}>
							<Button
								variant="accent"
								onClick={() => navigator.mediaDevices.getUserMedia({ video: true })}
							>
								{t("invite.join-scan-cta")}
							</Button>
							<Text with="body-sm">{orText}</Text>
						</Show>
						<Text class="text-balance text-center">{t("invite.join-link")}</Text>
					</div>
				</Match>
			</Switch>
			<Button variant="ghost" onClick={props.onCancel}>
				{t("invite.cta-cancel")}
			</Button>
		</div>
	);
}
