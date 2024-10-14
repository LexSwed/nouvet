import { Drawer, Popover, startViewTransition, tw } from "@nou/ui";
import { type Accessor, type JSX, type ParentProps, Show, Suspense } from "solid-js";

import "./multi-screen-popover.module.css";
import { Dynamic } from "solid-js/web";

interface MultiScreenPopoverProps {
	id: string;
	class?: string;
	component?: "popover" | "drawer";
	children: (controls: MultiScreenPopoverControls) => JSX.Element;
}

export type MultiScreenPopoverControls = {
	update: (callback: () => void, direction?: "forwards" | "backwards") => Promise<void>;
	close: () => void;
};

export function MultiScreenPopover(props: MultiScreenPopoverProps) {
	/**
	 * - Call callback to set new step
	 * - Transition starts
	 * - Rendering is finished and transition is ended
	 * - start view transition
	 *
	 */
	const update = async (callback: () => void, direction: "forwards" | "backwards" = "forwards") => {
		await startViewTransition({
			update: callback,
			types: ["slide", direction],
		}).finished;
		document.getElementById(props.id)?.focus();
	};

	const close = () => {
		const popover = document.getElementById(props.id);
		popover?.hidePopover();
	};

	return (
		<Dynamic
			component={props.component === "drawer" ? Drawer : Popover}
			id={props.id}
			placement="center"
			aria-labelledby={`${props.id}-headline`}
			class={tw("view-transition-[multi-screen-popover]", props.class)}
		>
			{(open: Accessor<boolean>) => {
				return (
					<Suspense>
						<Show when={open()}>
							{(open) => {
								if (!open()) return null;

								return props.children({ update, close });
							}}
						</Show>
					</Suspense>
				);
			}}
		</Dynamic>
	);
}

export function MultiScreenPopoverHeader(props: {
	children: JSX.Element;
	class?: string;
}) {
	return (
		<header
			class={tw(
				"view-transition-[multi-screen-popover-header] -mt-4 -mx-2 z-10 flex flex-row items-center gap-2",
				props.class,
			)}
		>
			{props.children}
		</header>
	);
}

export function MultiScreenPopoverContent(props: ParentProps<{ class?: string }>) {
	return (
		<div class={tw("view-transition-[multi-screen-popover-content]", props.class)}>
			{props.children}
		</div>
	);
}
