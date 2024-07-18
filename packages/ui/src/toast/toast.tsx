import { createSingletonRoot } from "@solid-primitives/rootless";
import {
	type ComponentProps,
	For,
	type JSX,
	type JSXElement,
	type ParentProps,
	createEffect,
	createMemo,
	createSignal,
	createUniqueId,
	getOwner,
	onCleanup,
	runWithOwner,
	splitProps,
} from "solid-js";
import { Card } from "../card";
import { mergeDefaultProps, startViewTransition } from "../utils";

/**
 * TODO:
 * - reset timer when mouse is over the group of toasts
 * - move back older notifications behind the new one
 * - show all notifications as list when the pointer is over
 */

const Toast = (
	ownProps: ComponentProps<typeof Card<"div">> & { duration?: number; onTimeout: () => void },
) => {
	const [local, props] = splitProps(ownProps, ["onTimeout", "duration"]);
	let element: HTMLLIElement | null = null;
	createEffect(() => {
		if (!local.duration) return null;
		const id = setTimeout(async () => {
			await Promise.allSettled(element!.getAnimations().map((animation) => animation.finished));
			local.onTimeout();
		}, local.duration);
		onCleanup(() => {
			clearTimeout(id);
		});
	});

	return (
		<Card
			as="li"
			ref={(el: HTMLLIElement) => {
				element = el;
			}}
			class="starting:-translate-y-1 shadow-popover duration-300 ease-out"
			{...props}
		>
			{props.children}
		</Card>
	);
};

const useToasts = createSingletonRoot(() => {
	return createSignal<JSXElement[]>([]);
});

function Toaster(props: { label: string }) {
	const [toasts] = useToasts();
	const [ref, setRef] = createSignal<HTMLElement | null>(null);

	createEffect(() => {
		const root = ref();
		if (!root) return;
		if (toasts().length > 0) {
			root.showPopover();
		} else {
			root.hidePopover();
		}
	});
	return (
		<div
			// Popover is used to ensure that if notification is triggered from a dialog or any
			// top layer element, the toast appears on top of it
			popover="manual"
			id="nou-ui-toaster"
			class="fixed top-0 mx-auto my-0 bg-transparent"
			role="region"
			aria-label={props.label}
			ref={setRef}
		>
			<ol class="flex flex-col items-center gap-4 empty:hidden" tabIndex={-1}>
				<For each={toasts()}>{(el) => <>{el}</>}</For>
			</ol>
		</div>
	);
}

function useToaster(id?: string) {
	const [, setToasts] = useToasts();
	const owner = getOwner();
	return (element: () => JSX.Element, ownProps: ParentProps<{ duration?: number; id?: string }>) =>
		runWithOwner(owner, () => {
			const props = mergeDefaultProps(ownProps, {
				get id() {
					return id || createUniqueId();
				},
				duration: 3000,
			});
			const child = createMemo(() => (
				<Toast
					{...props}
					onTimeout={() => {
						cleanup();
					}}
				>
					{element()}
				</Toast>
			));
			function cleanup() {
				startViewTransition(() => {
					setToasts((toasts) => toasts.filter((t) => t !== child()));
				});
			}
			createEffect(() => {
				setToasts((renders) => [...renders, child()]);
				onCleanup(cleanup);
			});
			return cleanup;
		});
}

export { useToaster, Toaster };
