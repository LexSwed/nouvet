import { createSingletonRoot } from "@solid-primitives/rootless";
import {
	type Accessor,
	type ComponentProps,
	For,
	type JSX,
	type ResolvedChildren,
	children,
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

import { tw } from "../tw";
import { composeEventHandlers } from "../utils";
import css from "./toast.module.css";
/**
 * TODO:
 * - reset timer when mouse is over the group of toasts
 * - reset timer when tab lost focus
 */

interface ToastProps extends ComponentProps<typeof Card<"li">> {
	style?: JSX.CSSProperties;
}

const Toast = (ownProps: ToastProps) => {
	const [, props] = splitProps(ownProps, []);
	return (
		<Card
			aria-atomic="true"
			role="status"
			tabIndex={0}
			{...props}
			class={tw("allow-discrete border border-on-background/5 shadow-popover", props.class)}
			onClick={composeEventHandlers(props.onClick, (e) => {
				(e.currentTarget as HTMLElement).dispatchEvent(new ToastDismissEvent());
			})}
		>
			{props.children}
		</Card>
	);
};

interface ToastEntry {
	id: string;
	anchorName: string;
	positionAnchor: string | undefined;
	element: Accessor<ResolvedChildren>;
}

const useToastsController = createSingletonRoot(() => {
	const [items, setItems] = createSignal<Array<ToastEntry>>([]);

	return {
		items,
		add: (element: Accessor<ResolvedChildren>) => {
			const id = createUniqueId();
			const [positionAnchor, setPositionAnchor] = createSignal<string | undefined>(undefined);

			setItems((rendered) => {
				const newItem = {
					id,
					element,
					anchorName: `--nou-toast-anchor-${id}`,
					get positionAnchor(): string | undefined {
						return positionAnchor();
					},
					set positionAnchor(value: string | undefined) {
						setPositionAnchor(value);
					},
				};
				const currentTopItem = rendered.at(0);
				if (currentTopItem) {
					currentTopItem.positionAnchor = newItem.anchorName;
				}
				return [newItem, ...rendered];
			});
		},
		remove: (id: string) => {
			setItems((rendered) => {
				// TODO: move focus to the next toast
				const index = rendered.findIndex((item) => item.id === id);
				if (index === -1) return rendered;
				// biome-ignore lint/style/noParameterAssign: it's ok
				rendered = rendered.toSpliced(index, 1);
				const newItemOnRemovedIndex = rendered.at(index);
				const newTopItem = rendered.at(index - 1);
				if (newItemOnRemovedIndex && newTopItem) {
					newItemOnRemovedIndex.positionAnchor = newTopItem.anchorName;
				}
				const newElementOnRemovedIndex = newItemOnRemovedIndex?.element();
				if (newElementOnRemovedIndex instanceof HTMLElement) {
					newElementOnRemovedIndex.focus();
				}
				return rendered;
			});
		},
	};
});
function Toaster(props: { label: string }) {
	const toaster = useToastsController();
	const [ref, setRef] = createSignal<HTMLElement | null>(null);
	const hasToasts = createMemo(() => toaster.items().length > 0);

	createEffect(() => {
		const root = ref();
		if (!root) return;
		if (hasToasts()) {
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
			class="fixed top-12 mx-auto my-0 overflow-visible bg-transparent p-0"
			role="region"
			aria-label={props.label}
			ref={setRef}
		>
			<ol class={tw(css.list, "fixed min-w-96 empty:pointer-events-none")} tabIndex={-1}>
				<For each={toaster.items()}>
					{(entry) => {
						return (
							<li
								class={tw(css.toast)}
								style={{
									"anchor-name": entry.anchorName,
									"position-anchor": entry.positionAnchor,
								}}
								on:toast-dismiss={() => toaster.remove(entry.id)}
							>
								{entry.element()}
							</li>
						);
					}}
				</For>
			</ol>
		</div>
	);
}

function useToaster() {
	const toaster = useToastsController();
	const owner = getOwner();
	return (element: () => JSX.Element) =>
		runWithOwner(owner, () => {
			const child = children(element);
			function cleanup() {
				// toaster.remove(child());
			}
			toaster.add(child);
			onCleanup(cleanup);
			return cleanup;
		});
}

export { useToaster, Toast, Toaster };

class ToastDismissEvent extends Event {
	constructor() {
		super("toast-dismiss", { bubbles: true });
	}
}

declare module "solid-js" {
	namespace JSX {
		interface CustomEvents {
			"toast-dismiss": ToastDismissEvent;
		}
		interface CustomCaptureEvents {
			"toast-dismiss": ToastDismissEvent;
		}
	}
}
