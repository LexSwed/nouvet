import { Card } from "@nou/ui";
import { type RouteDefinition, type RouteSectionProps, createAsync } from "@solidjs/router";
import { Show } from "solid-js";

import { getFamilyMember, getFamilyMembers } from "~/server/api/family";
import { queryDictionary } from "~/server/i18n";
import type { UserID } from "~/server/types";

export const route = {
	load({ params }) {
		void queryDictionary("family");
		void getFamilyMember(params.memberId as UserID);
	},
} satisfies RouteDefinition;

function FamilyUserPage(props: RouteSectionProps) {
	const partialMember = createAsync(async () => {
		const members = await getFamilyMembers();
		return members.find((m) => m.id === props.params.memberId);
	});
	const member = createAsync(() => getFamilyMember(props.params.memberId as UserID));

	const memberInfo = () => member() || partialMember();

	return (
		<Card variant="flat">
			<Show when={memberInfo()}>{(member) => <>{member().name}</>}</Show>
		</Card>
	);
}

export default FamilyUserPage;
