import { ButtonLink, Icon } from "@nou/ui";
import { createAsync } from "@solidjs/router";
import { Match, type ParentProps, Show, Switch, children } from "solid-js";

import { getUserFamily } from "~/server/api/user";
import { createTranslator } from "~/server/i18n";

import { AccountMenu } from "./account-menu";

export const AppHeader = (props: ParentProps & { backLink?: string }) => {
	const user = createAsync(() => getUserFamily());
	const t = createTranslator("app");
	const child = children(() => props.children);
	return (
		<Show when={user()}>
			{(user) => (
				<header class="container flex items-center justify-between gap-8 py-4">
					<Switch>
						<Match when={child()}>{child()}</Match>
						<Match when={props.backLink}>
							{(link) => (
								<ButtonLink href={link()} icon label={t("go-to-home-page")} variant="tonal">
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
