import * as React from "react";

import { cn } from "~/lib/utils.ts";

const NavCard = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"text-on-muted rounded-xl bg-muted/50 px-4 py-3 transition-colors hover:bg-muted/70 focus:bg-muted/70",
			className,
		)}
		{...props}
	/>
));
NavCard.displayName = "NavCard";

export { NavCard };
