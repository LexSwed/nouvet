import { ButtonLink, Icon } from "@nou/ui";
import { createAsync } from "@solidjs/router";
import { type JSX, Match, type ParentProps, Show, Switch, children } from "solid-js";

import { getUserFamily } from "~/server/api/user";
import { createTranslator } from "~/server/i18n";

import { AccountMenu } from "./account-menu";

export const AppHeader = (
	props: ParentProps & {
		backLink?: string;
		onBackClick?: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent>;
	},
) => {
	const user = createAsync(() => getUserFamily());
	const t = createTranslator("app");
	const child = children(() => props.children);
	return (
		<Show when={user()}>
			{(user) => (
				<header class="container flex items-center justify-between gap-8 py-4">
					<Switch>
						<Match when={child()}>{child()}</Match>
						<Match when={"backLink" in props && props.backLink}>
							{(link) => (
								<ButtonLink
									href={link()}
									onClick={props.onBackClick}
									icon
									label={t("go-to-home-page")}
									variant="tonal"
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
