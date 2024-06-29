import { Card } from "@nou/ui";
import { type RouteDefinition, type RouteSectionProps, createAsync } from "@solidjs/router";
import { Show } from "solid-js";

import { getFamilyMember, getFamilyMembers } from "~/server/api/family";
import { cacheTranslations } from "~/server/i18n";

export const route = {
	load({ params }) {
		void cacheTranslations("family");
		void getFamilyMember(params.memberId);
	},
} satisfies RouteDefinition;

function FamilyUserPage(props: RouteSectionProps) {
	const partialMember = createAsync(async () => {
		const members = await getFamilyMembers();
		return members.find((m) => m.id === props.params.memberId);
	});
	const member = createAsync(() => getFamilyMember(props.params.memberId));

	const memberInfo = () => member() || partialMember();

	return (
		<Card variant="flat">
			<Show when={memberInfo()}>{(member) => <>{member().name}</>}</Show>
		</Card>
	);
}

export default FamilyUserPage;
