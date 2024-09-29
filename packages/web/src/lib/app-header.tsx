import { ButtonLink, Icon, tw } from "@nou/ui";
import { createAsync, useLocation, useNavigate } from "@solidjs/router";
import { type JSX, Match, type ParentProps, Show, Switch, children } from "solid-js";

import { getUserFamily } from "~/server/api/user";
import { createTranslator } from "~/server/i18n";

import { AccountMenu } from "./account-menu";

export const AppHeader = (
	props: ParentProps & {
		backLink?: string;
		onBackClick?: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent>;
		class?: string;
	},
) => {
	const user = createAsync(() => getUserFamily());
	const t = createTranslator("app");
	const child = children(() => props.children);
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<Show when={user()}>
			{(user) => (
				<header class={tw("container flex items-center justify-between gap-8 py-4", props.class)}>
					<Switch>
						<Match when={child()}>{child()}</Match>
						<Match when={"backLink" in props && props.backLink}>
							{(link) => (
								<ButtonLink
									href={link()}
									icon
									label={t("go-to-home-page")}
									variant="tonal"
									onClick={(e) => {
										if (
											location.state &&
											"previous" in location.state &&
											typeof location.state.previous === "string"
										) {
											e.preventDefault();
											navigate(location.state.previous);
										}
									}}
								>
									<Icon use="chevron-left" />
								</ButtonLink>
							)}
						</Match>
					</Switch>
					<AccountMenu name={user().name || ""} avatarUrl={user().avatarUrl!} />
				</header>
			)}
		</Show>
	);
};
