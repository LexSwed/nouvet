import { type SVGProps } from "react";

import { tw } from "~/lib/ui/tw.ts";
import type { SvgIcons } from "./svg-icons";
export type { SvgIcons };

const sizeClassName = {
	font: "w-font h-font",
	xs: "w-3 h-3",
	sm: "w-4 h-4",
	md: "w-5 h-5",
	lg: "w-6 h-6",
	xl: "w-7 h-7",
} as const;

type Size = keyof typeof sizeClassName;

export function Icon({
	use,
	size = "font",
	className,
	...props
}: SVGProps<SVGSVGElement> & {
	use: SvgIcons;
	size?: Size;
}) {
	return (
		<svg {...props} className={tw(sizeClassName[size], "inline", className)}>
			<use href={`/assets/sprite.svg#${use}`} />
		</svg>
	);
}
