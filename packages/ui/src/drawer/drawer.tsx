import {
	type Accessor,
	type JSX,
	Show,
	type ValidComponent,
	createMemo,
	createSignal,
	splitProps,
} from "solid-js";

import { Popover, type PopoverProps } from "../popover";
import { tw } from "../tw";

import { createMediaQuery } from "@solid-primitives/media";
import { mergeRefs } from "@solid-primitives/refs";
import css from "../popover/popover.module.css";
import { composeEventHandlers, mergeDefaultProps } from "../utils";

type Side = "top" | "bottom" | "left" | "right";
type DrawerProps<T extends ValidComponent = "div"> = PopoverProps<T> & {
	/**
	 * The side from which the drawer is open.
	 * @default "bottom"
	 */
	side?: Side;
};

const Drawer = <T extends ValidComponent = "div">(ownProps: DrawerProps<T>) => {
	const [local, props] = splitProps(
		mergeDefaultProps(ownProps as DrawerProps<"div">, { side: "bottom" }),
		["side", "class", "style", "ref", "children"],
	);

	const dragHandlers = createDragHandlers(local);

	const child = createMemo(() => local.children);

	const dragHandle = (
		<div class="grid w-full place-content-center pt-2 pb-3 sm:hidden">
			<div class="h-1 w-8 rounded-full bg-on-surface/30" />
		</div>
	);

	return (
		<Popover
			class={tw(css.drawer, local.class, "max-w-[640px]")}
			{...props}
			ref={mergeRefs(local.ref, dragHandlers.ref)}
			// === SharedElementProps ===
			style={{
				...dragHandlers.style,
				...local.style,
			}}
			onToggle={composeEventHandlers(props.onToggle, dragHandlers.onToggle)}
			onPointerDown={composeEventHandlers(props.onPointerDown, dragHandlers.onPointerDown)}
			onTouchStart={composeEventHandlers(props.onTouchStart, dragHandlers.onTouchStart)}
		>
			{(open) => (
				<Show
					when={typeof child() === "function" ? child() : false}
					children={
						<>
							{dragHandle}
							{/* @ts-expect-error conversion */}
							{child()(open)}
						</>
					}
					fallback={
						<>
							{dragHandle}
							{child()}
						</>
					}
				/>
			)}
		</Popover>
	);
};

export { Drawer };

/**
 * This is mostly a copy and paste of Corvu Drawer:
 * https://github.com/corvudev/corvu/tree/main/packages/drawer
 */
function createDragHandlers(props: { side: Side }) {
	const [isDragging, setIsDragging] = createSignal();
	const [translate, setTranslate] = createSignal(0);
	const [popoverRef, setPopoverRef] = createSignal<HTMLElement | null>(null);

	let pointerDown = false;
	let dragStartPos: number | null = null;
	const VELOCITY_CACHE_RESET = 200;

	// Values used to handle dragging on scrollable elements.
	let currentPointerStart: [number, number] = [0, 0];

	let cachedMoveTimestamp = 0;
	let cachedTranslate = 0;

	const drawerSize = createSize({
		element: popoverRef,
		dimension: () => {
			switch (props.side) {
				case "top":
				case "bottom":
					return "height";
				case "left":
				case "right":
					return "width";
			}
		},
	});

	const isMobile = createMediaQuery(
		// @screen(sm)
		"(max-width: 640px)",
		true,
	);

	const transformValue = createMemo(() => {
		switch (props.side) {
			case "top":
				return `translate3d(0, ${-translate()}px, 0)`;
			case "bottom":
				return `translate3d(0, ${translate()}px, 0)`;
			case "right":
				return `translate3d(${translate()}px, 0, 0)`;
			case "left":
				return `translate3d(${-translate()}px, 0, 0)`;
		}
	});

	const onPopoverToggle = (event: ToggleEvent) => {
		if (!isMobile()) return null;

		setTranslate(0);

		if (event.newState === "open") {
			document.addEventListener("pointermove", onPointerMove);
			document.addEventListener("touchmove", onTouchMove);
			document.addEventListener("pointerup", onPointerUp);
			document.addEventListener("touchend", onTouchEnd);
			document.addEventListener("contextmenu", onUp);
		} else {
			document.removeEventListener("pointermove", onPointerMove);
			document.removeEventListener("touchmove", onTouchMove);
			document.removeEventListener("pointerup", onPointerUp);
			document.removeEventListener("touchend", onTouchEnd);
			document.removeEventListener("contextmenu", onUp);

			currentPointerStart = [0, 0];
		}
	};

	const onPointerDown = (event: PointerEvent) => {
		if (event.button !== 0) return;
		if (!locationIsDraggable(event.target as HTMLElement, popoverRef()!, event.pointerType)) return;

		pointerDown = true;
		currentPointerStart = [event.clientX, event.clientY];
	};

	const onPointerMove = (event: PointerEvent) => {
		onMove(event.target as HTMLElement, event.clientX, event.clientY);
	};
	const onTouchMove = (event: TouchEvent) => {
		if (!event.touches[0]) return;
		onMove(event.target as HTMLElement, event.touches[0].clientX, event.touches[0].clientY);
	};

	const onMove = (target: HTMLElement, x: number, y: number) => {
		if (!pointerDown) return;

		if (!isDragging() || dragStartPos === null) {
			const selection = window.getSelection();
			if (selection && selection.toString().length > 0) {
				onUp();
				return;
			}

			const delta = [x, y].map((pointer, i) => currentPointerStart[i]! - pointer) as [
				number,
				number,
			];
			const axis: Axis = Math.abs(delta[0]) > Math.abs(delta[1]) ? "x" : "y";
			const axisDelta = axis === "x" ? delta[0] : delta[1];

			if (Math.abs(axisDelta) < 0.3) return;

			const [availableScroll, availableScrollTop] = getScrollAtLocation(
				target,
				axis,
				popoverRef()!,
			);

			// On firefox, availableScroll can be 1 even if there is no scroll available.
			if (
				(axisDelta > 0 && Math.abs(availableScroll) > 1) ||
				(axisDelta < 0 && Math.abs(availableScrollTop) > 0)
			) {
				onUp();
				return;
			}

			switch (props.side) {
				case "top":
				case "bottom":
					dragStartPos = y;
					break;
				case "right":
				case "left":
					dragStartPos = x;
			}

			cachedMoveTimestamp = Date.now();
			cachedTranslate = translate();

			setIsDragging(true);
		}

		let delta: number;
		switch (props.side) {
			case "top":
				delta = -(dragStartPos - y);
				break;
			case "bottom":
				delta = dragStartPos - y;
				break;
			case "right":
				delta = dragStartPos - x;
				break;
			case "left":
				delta = -(dragStartPos - x);
				break;
		}

		if (delta > 0) delta = dampFunction(delta);

		if (Date.now() - cachedMoveTimestamp > VELOCITY_CACHE_RESET) {
			cachedMoveTimestamp = Date.now();
			cachedTranslate = translate();
		}

		setTranslate(-delta);
	};

	const onPointerUp = (event: PointerEvent) => {
		if (event.pointerType !== "touch") onUp();
	};

	const onTouchEnd = (event: TouchEvent) => {
		if (event.touches.length === 0) onUp();
	};

	const onUp = () => {
		pointerDown = false;

		if (!isDragging()) return;

		const velocity = velocityFunction(
			-(cachedTranslate - translate()),
			Date.now() - cachedMoveTimestamp || 1,
		);

		const translateWithVelocity = translate() * velocity;

		setIsDragging(false);

		if (translateWithVelocity > drawerSize()) {
			popoverRef()?.hidePopover();
		} else {
			setTranslate(0);
		}
	};

	const onTouchStart = (e: TouchEvent) => {
		if (e.touches.length !== 1) return;
		dragStartPos = null;
	};

	return {
		get style() {
			if (!isDragging()) return undefined;
			return {
				transform: transformValue(),
				"transition-duration": isDragging() ? "0ms" : undefined,
			} satisfies JSX.CSSProperties;
		},
		ref: setPopoverRef,
		onToggle: onPopoverToggle,
		onPointerDown,
		onTouchStart,
	};
}

/**
 * Returns true if the given location is draggable.
 * An element is draggable if:
 * - The target element and all of its parents don't have the `draggable=false` attribute present.
 * - The target element is not an input of type range.
 * - If the pointerType is mouse, the target element is not a <select> element.
 *
 * @param location - The HTMLElement to check.
 * @param stopAt - The HTMLElement to stop at when searching up the tree.
 * @param pointerType - The type of pointer that is being used.
 * @returns Whether the location is draggable.
 */
export const locationIsDraggable = (
	location: HTMLElement,
	stopAt: HTMLElement,
	pointerType: string,
) => {
	let currentElement: HTMLElement | null = location;

	let stopReached = false;

	do {
		if (
			currentElement.getAttribute("draggable") === "false" ||
			(currentElement as HTMLInputElement).type === "range" ||
			(currentElement.tagName === "SELECT" && pointerType === "mouse")
		)
			return false;

		if (currentElement === stopAt) {
			stopReached = true;
		} else {
			currentElement = currentElement.parentElement;
		}
	} while (currentElement && !stopReached);

	return true;
};

function dampFunction(distance: number) {
	return 6 * Math.log(distance + 1);
}

function velocityFunction(distance: number, time: number) {
	const velocity = distance / time;
	return velocity < 1 && velocity > -1 ? 1 : velocity;
}

import { createEffect, onCleanup } from "solid-js";

function createSize(props: {
	element: Accessor<HTMLElement | null>;
	dimension: Accessor<"width" | "height">;
}) {
	const [size, setSize] = createSignal(0);

	createEffect(() => {
		const element = props.element();
		if (!element) return;

		syncSize(element);

		const observer = new ResizeObserver(resizeObserverCallback);
		observer.observe(element);
		onCleanup(() => {
			observer.disconnect();
		});
	});

	const resizeObserverCallback = ([entry]: ResizeObserverEntry[]) => {
		syncSize(entry!.target as HTMLElement);
	};

	const syncSize = (element: HTMLElement) => {
		switch (props.dimension()) {
			case "width":
				setSize(element.offsetWidth);
				break;
			case "height":
				setSize(element.offsetHeight);
				break;
		}
	};

	return size;
}

/**
 * Returns the total scroll available at the given location.
 *
 * @param location - The HTMLElement to check.
 * @param axis - The axis to check for.
 * @param stopAt - The HTMLElement to stop at when searching up the tree for scrollable elements. Defaults to the body element. Works with SolidJS portals by using their `_$host` property.
 * @returns The total scroll available at the given location. `[availableScroll, availableScrollTop]`
 */
const getScrollAtLocation = (location: HTMLElement, axis: Axis, stopAt?: HTMLElement) => {
	const directionFactor =
		axis === "x" && window.getComputedStyle(location).direction === "rtl" ? -1 : 1;

	let currentElement: HTMLElement | null = location;
	let availableScroll = 0;
	let availableScrollTop = 0;
	let wrapperReached = false;

	do {
		const [clientSize, scrollOffset, scrollSize] = getScrollDimensions(currentElement, axis);

		const scrolled = scrollSize - clientSize - directionFactor * scrollOffset;

		if ((scrollOffset !== 0 || scrolled !== 0) && isScrollContainer(currentElement, axis)) {
			availableScroll += scrolled;
			availableScrollTop += scrollOffset;
		}
		if (currentElement === (stopAt ?? document.documentElement)) {
			wrapperReached = true;
		} else {
			currentElement = currentElement.parentElement;
		}
	} while (currentElement && !wrapperReached);

	return [availableScroll, availableScrollTop] as [number, number];
};

type Axis = "x" | "y";

/**
 * Returns the scroll dimensions of the given element on the given axis.
 *
 * @param element - The element to check.
 * @param axis - The axis to check for.
 * @returns The scroll dimensions of the element. `[clientSize, scrollOffset, scrollSize]`
 */
const getScrollDimensions = (element: HTMLElement, axis: Axis): [number, number, number] => {
	switch (axis) {
		case "x":
			return [element.clientWidth, element.scrollLeft, element.scrollWidth];
		case "y":
			return [element.clientHeight, element.scrollTop, element.scrollHeight];
	}
};

/**
 * Returns true if the given element is a scroll container on the given axis. Scroll containers are elements with `overflow` set to `auto` or `scroll`.
 *
 * @param element - The element to check.
 * @param axis - The axis to check for.
 * @returns Whether the element is a scroll container.
 */
const isScrollContainer = (element: HTMLElement, axis: Axis | "both") => {
	const styles = getComputedStyle(element);
	const overflow = axis === "x" ? styles.overflowX : styles.overflowY;

	return (
		overflow === "auto" ||
		overflow === "scroll" ||
		// The HTML element is a scroll container if it has overflow visible
		(element.tagName === "HTML" && overflow === "visible")
	);
};
