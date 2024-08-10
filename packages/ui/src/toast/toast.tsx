import { createSingletonRoot } from "@solid-primitives/rootless";
import {
	type Accessor,
	type ComponentProps,
	For,
	type JSX,
	type ResolvedChildren,
	Show,
	children,
	createEffect,
	createMemo,
	createSignal,
	createUniqueId,
	onCleanup,
	onMount,
	splitProps,
} from "solid-js";
import { Card } from "../card";

import { Icon } from "../_index";
import { Button } from "../button";
import { tw } from "../tw";
import { mergeDefaultProps } from "../utils";
import css from "./toast.module.css";
/**
 * TODO:
 * - show how many toasts are hidden
 * - tones
 * - swipe to remove
 * - positions
 * - hotkey command to focus on notifications region
 * - navigate through the items with keyboard arrows
 */

interface ToastProps extends ComponentProps<typeof Card<"li">> {
	heading?: JSX.Element;
	style?: JSX.CSSProperties;
}

const Toast = (ownProps: ToastProps) => {
	const [local, props] = splitProps(mergeDefaultProps(ownProps, { "aria-live": "polite" }), [
		"heading",
	]);
	const heading = children(() => local.heading);
	const ariaLabel = `nou-toast-${createUniqueId()}`;
	return (
		<Card
			role="status"
			tabIndex={0}
			aria-atomic="true"
			{...props}
			class={tw(
				"allow-discrete max-w-80 border border-on-background/5 shadow-popover",
				props.class,
			)}
			aria-labelledby={ariaLabel}
			// onClick={composeEventHandlers(props.onClick, (e) => {
			// 	(e.currentTarget as HTMLElement).dispatchEvent(new ToastDismissEvent());
			// })}
		>
			<Show when={heading()}>
				<div class={tw("flex items-baseline justify-between gap-3")}>
					<div id={ariaLabel} class="contents">
						{heading()}
					</div>
					<Button
						type="reset"
						variant="ghost"
						size="sm"
						icon
						class={tw(css.removeToast, "-my-4 -me-3 leading-[inherit] transition-all duration-300")}
						onClick={(e) => {
							(e.currentTarget as HTMLElement).dispatchEvent(new ToastDismissEvent());
						}}
					>
						<Icon use="x" size="xs" />
					</Button>
				</div>
			</Show>
			{props.children}
		</Card>
	);
};

interface ToastEntry {
	id: string;
	anchorName: string;
	positionAnchor: string | undefined;
	element: Accessor<ResolvedChildren>;
	timer: { reset: () => void; restart: (delay: number) => void };
}

interface ToastOptions {
	/** Time in ms after which the toast will be automatically hidden.
	 * @example Infinity - disable automatic hiding.
	 * @default 3000
	 */
	duration?: number;
}

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

	onMount(() => {
		const controller = new AbortController();
		document.addEventListener(
			"visibilitychange",
			() => {
				if (document.visibilityState === "hidden") {
					toaster.resetTimers();
				} else {
					toaster.restartTimers();
				}
			},
			{ signal: controller.signal },
		);

		onCleanup(() => {
			controller.abort();
		});
	});

	let isMouseIn = false;
	let isFocusIn = false;

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
			<ol
				class={tw(
					css.list,
					"-m-4 fixed inset-x-0 flex w-full flex-col items-center empty:pointer-events-none",
				)}
				tabIndex={-1}
				onMouseEnter={() => {
					isMouseIn = true;
					toaster.resetTimers();
				}}
				onMouseLeave={() => {
					isMouseIn = false;
					if (!isFocusIn) {
						toaster.restartTimers();
					}
				}}
				onFocusIn={() => {
					isFocusIn = true;
					toaster.resetTimers();
				}}
				onFocusOut={() => {
					isFocusIn = false;
					if (!isMouseIn) {
						toaster.restartTimers();
					}
				}}
			>
				<div class="-m-1 absolute h-1 w-full [anchor-name:--nou-toast-anchor-list]" aria-hidden />
				<For each={toaster.items()}>
					{(entry, index) => {
						return (
							<li
								class={tw(css.toast, "min-h-16")}
								style={{
									"anchor-name": entry.anchorName,
									"position-anchor": entry.positionAnchor ?? "--nou-toast-anchor-list",
									"--nou-toast-index": toaster.items().length - index(),
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

function toast(element: () => JSX.Element) {
	const toaster = useToastsController();
	const child = children(element);
	const item = toaster.add(child);
	function cleanup() {
		toaster.remove(item.id);
	}
	onCleanup(cleanup);
	return {
		cleanup,
	};
}

export { toast, Toast, Toaster };

const useToastsController = createSingletonRoot(() => {
	const [items, setItems] = createSignal<Array<ToastEntry>>([]);

	function addToast(element: Accessor<ResolvedChildren>, options?: ToastOptions) {
		const id = createUniqueId();
		const [positionAnchor, setPositionAnchor] = createSignal<string | undefined>(undefined);
		const { duration = 3000 } = options || {};
		let timer = setTimeout(() => removeToast(id), duration);
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
			timer: {
				reset: () => clearTimeout(timer),
				restart: (delay: number) => {
					timer = setTimeout(() => removeToast(id), duration + delay);
				},
			},
		} satisfies ToastEntry;

		setItems((rendered) => {
			const currentTopItem = rendered.at(0);
			if (currentTopItem) {
				currentTopItem.positionAnchor = newItem.anchorName;
			}
			return [newItem, ...rendered];
		});
		return newItem;
	}

	function removeToast(id: string) {
		setItems((rendered) => {
			// TODO: move focus to the next toast
			const index = rendered.findIndex((item) => item.id === id);
			if (index === -1) return rendered;
			// biome-ignore lint/style/noParameterAssign: it's ok
			rendered = rendered.toSpliced(index, 1);
			const newItemOnRemovedIndex = rendered.at(index);
			// NB: do not use .at() as it will map to the last element
			const newTopItem = rendered[index - 1];
			if (newItemOnRemovedIndex && newTopItem) {
				newItemOnRemovedIndex.positionAnchor = newTopItem.anchorName;
			} else if (newItemOnRemovedIndex) {
				newItemOnRemovedIndex.positionAnchor = undefined;
			}
			const newElementOnRemovedIndex = newItemOnRemovedIndex?.element();
			if (newElementOnRemovedIndex instanceof HTMLElement) {
				newElementOnRemovedIndex.focus();
			}
			return rendered;
		});
	}

	function resetTimers() {
		for (const item of items()) {
			item.timer.reset();
		}
	}

	function restartTimers() {
		items().forEach((item, index, list) => {
			item.timer.restart((list.length - index) * 300);
		});
	}

	return {
		items,
		add: addToast,
		remove: removeToast,
		resetTimers,
		restartTimers,
	};
});
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
