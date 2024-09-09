import { Button, Icon, Popover, Text, startViewTransition } from "@nou/ui";
import { type JSX, type ParentProps, Show, Suspense } from "solid-js";
import { createTranslator } from "~/server/i18n";

import "./multi-screen-popover.module.css";

interface MultiScreenPopoverProps {
	id: string;
	children: (controls: MultiScreenPopoverControls) => JSX.Element;
}

export type MultiScreenPopoverControls = {
	update: (callback: () => void, direction?: "forwards" | "backwards") => Promise<void>;
	close: () => void;
};

export function MultiScreenPopover(props: MultiScreenPopoverProps) {
	const update = async (callback: () => void, direction: "forwards" | "backwards" = "forwards") => {
		await startViewTransition({
			update: () => {
				callback();
			},
			types: ["slide", direction],
		}).finished;

		const popover = document.getElementById(props.id);
		popover?.focus();
	};

	const close = () => {
		const popover = document.getElementById(props.id);
		popover?.hidePopover();
	};

	return (
		<Popover
			id={props.id}
			placement="center"
			aria-labelledby={`${props.id}-headline`}
			role="dialog"
			class="view-transition-[multi-screen-popover] mt-[16vh] flex w-[94svw] max-w-[420px] flex-col gap-6 bg-gradient-to-b from-surface via-65% via-surface to-primary/10 p-6 md:mt-[20vh]"
		>
			{(open) => {
				return (
					<Suspense>
						<Show when={open()}>
							{(open) => {
								if (open()!) return props.children({ update, close });
								return null;
							}}
						</Show>
					</Suspense>
				);
			}}
		</Popover>
	);
}

export function MultiScreenPopoverHeader(props: {
	id: string;
	headline: JSX.Element;
	backButton: JSX.Element;
}) {
	const t = createTranslator("app");
	return (
		<header class="view-transition-[multi-screen-popover-header] -m-4 z-10 flex flex-row items-center justify-between gap-2">
			{props.backButton}
			<Text aria-hidden class="sr-only" id={`${props.id}-headline`} aria-live="polite">
				{props.headline}
			</Text>
			<Button
				variant="ghost"
				popoverTarget={props.id}
				popoverTargetAction="hide"
				aria-controls={props.id}
				icon
				label={t("dialog.close")}
			>
				<Icon use="x" />
			</Button>
		</header>
	);
}

export function MultiScreenPopoverContent(props: ParentProps) {
	return <div class="view-transition-[dialog-content] flex flex-col gap-6">{props.children}</div>;
}
