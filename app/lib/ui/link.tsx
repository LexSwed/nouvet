import * as React from "react";
import { Link as RemixLink, type LinkProps } from "@remix-run/react";
export { type LinkProps } from "@remix-run/react";

import { cn } from "~/lib/utils.ts";

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
	({ className, type, ...props }, ref) => {
		return (
			<RemixLink
				className={cn(
					"px-2 py-1 text-base underline underline-offset-2",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Link.displayName = "RemixLink";

export { Link };
