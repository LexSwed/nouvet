import { createSingletonRoot } from "@solid-primitives/rootless";
import {
	type ChildrenReturn,
	type ComponentProps,
	For,
	type JSX,
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
import { composeEventHandlers, startViewTransition } from "../utils";

import { tw } from "../tw";
import css from "./toast.module.css";
/**
 * TODO:
 * - reset timer when mouse is over the group of toasts
 * - move back older notifications behind the new one
 * - show all notifications as list when the pointer is over
 */

interface ToastProps extends ComponentProps<typeof Card<"li">> {}

const Toast = (ownProps: ToastProps) => {
	const [local, props] = splitProps(ownProps, ["id", "as"]);
	const localId = createUniqueId();
	const id = () => local.id || localId;
	return (
		<Card
			as="li"
			aria-atomic="true"
			role="status"
			tabIndex={0}
			class={tw(css.toast, "allow-discrete pointer-events-auto shadow-popover")}
			{...props}
			id={id()}
			style={{ "view-transition-name": `nou-toast-${id()}` }}
			onClick={composeEventHandlers(props.onClick, (e) => {
				(e.currentTarget as HTMLElement).dispatchEvent(new ToastDismissEvent(id()));
			})}
		>
			{props.children}
		</Card>
	);
};

const useToasts = createSingletonRoot(() => {
	return createSignal<ChildrenReturn[]>([]);
});

function Toaster(props: { label: string }) {
	const [toasts, setToasts] = useToasts();
	const [ref, setRef] = createSignal<HTMLElement | null>(null);
	const hasToasts = createMemo(() => toasts().length > 0);

	function removeElementById(id: string) {
		startViewTransition(() => {
			setToasts((rendered) =>
				rendered.filter((toast) => {
					const el = toast();
					if (el instanceof HTMLElement) {
						return el instanceof HTMLElement && el.id !== id;
					}
				}),
			);
		});
	}

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
			id="nou-ui-toaster"
			class="pointer-events-none fixed top-0 mx-auto my-0 overflow-visible bg-transparent p-0"
			role="region"
			aria-label={props.label}
			ref={setRef}
		>
			<ol
				class={tw("flex flex-col items-center gap-4 empty:hidden")}
				tabIndex={-1}
				on:toast-dismiss={(e) => {
					const { id } = e.detail;
					removeElementById(id);
				}}
			>
				<For each={toasts()}>{(el) => el()}</For>
			</ol>
		</div>
	);
}

function useToaster() {
	const [, setToasts] = useToasts();
	const owner = getOwner();
	return (element: () => JSX.Element) =>
		runWithOwner(owner, () => {
			const child = children(element);
			function cleanup() {
				startViewTransition(() => {
					setToasts((toasts) => toasts.filter((t) => t() !== child()));
				});
			}
			startViewTransition(() => {
				setToasts((renders) => [...renders, child]);
			});
			onCleanup(cleanup);
			return cleanup;
		});
}

export { useToaster, Toast, Toaster };

class ToastDismissEvent extends CustomEvent<{ id: string }> {
	constructor(id: string) {
		super("toast-dismiss", { bubbles: true, detail: { id } });
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
