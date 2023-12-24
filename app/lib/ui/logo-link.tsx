import { Link, type LinkProps } from "@remix-run/react";
import { Icon } from "./icon";
import { tw } from "./tw.ts";

function LogoLink({ className, label }: { label: string; className?: string }) {
	return (
		<Link
			to="/"
			aria-label={label}
			title={label}
			className={tw("flex flex-row items-center gap-4", className)}
		>
			<Icon use="nouvet" className="h-14 w-14" />
			<span className="hidden text-lg sm:inline-block">{label}</span>
		</Link>
	);
}

export { LogoLink };
