import { Outlet } from "@remix-run/react";

export default function FamilyRoute() {
	return (
		<div>
			This root page is the main hub for authenticated family content.
			<Outlet />
		</div>
	);
}
