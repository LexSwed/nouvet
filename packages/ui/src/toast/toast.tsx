import { createSingletonRoot } from "@solid-primitives/rootless";
import {
	type Accessor,
	type ComponentProps,
	Index,
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
import css from "./toast.module.css";
/**
 * TODO:
 * - reset timer when mouse is over the group of toasts
 * - move back older notifications behind the new one
 * - show all notifications as list when the pointer is over
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
		>
			{props.children}
		</Card>
	);
};

interface ToastEntry {
	id: string;
	element: Accessor<ResolvedChildren>;
}

const useToastsController = createSingletonRoot(() => {
	const [items, setItems] = createSignal<Array<ToastEntry>>([]);

	return {
		items,
		add: (element: Accessor<ResolvedChildren>) => {
			const id = createUniqueId();
			setItems((rendered) => [{ id, element }, ...rendered]);
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
			id="nou-ui-toaster"
			class="pointer-events-none fixed top-12 mx-auto my-0 overflow-visible bg-transparent p-0"
			role="region"
			aria-label={props.label}
			ref={setRef}
		>
			<ol
				class={tw(
					css.list,
					"-m-4 pointer-events-auto relative items-center gap-2 p-4 empty:hidden",
				)}
				tabIndex={-1}
			>
				<Index each={toaster.items()}>
					{(entry, i) => {
						let positionAnchor: string | undefined = undefined;
						console.log(i, `--nou-toast-anchor-${toaster.items().at(i - 1)?.id}`);
						if (i > 0) {
							positionAnchor = `--nou-toast-anchor-${toaster.items().at(i - 1)?.id}`;
						}

						return (
							<li
								class={tw(css.toast)}
								style={{
									"anchor-name": `--nou-toast-anchor-${entry().id}`,
									"position-anchor": positionAnchor,
								}}
							>
								{entry().element()}
							</li>
						);
					}}
				</Index>
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
