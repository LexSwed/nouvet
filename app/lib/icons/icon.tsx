import { type SVGProps } from "react";
import href from "./icon.svg";
export { href };

export const iconNames = [
	"arrow-circle-up-right",
	"nouvet",
	"package",
	"scroll",
	"stack",
] as const;
export type IconName = (typeof iconNames)[number];

import { tw } from "~/lib/ui/tw.ts";

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
	icon,
	size = "font",
	className,
	...props
}: SVGProps<SVGSVGElement> & {
	icon: IconName;
	size?: Size;
}) {
	return (
		<svg {...props} className={tw(sizeClassName[size], "inline", className)}>
			<use href={`${href}#${icon}`} />
		</svg>
	);
}
