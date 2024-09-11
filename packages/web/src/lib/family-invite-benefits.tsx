import { tw } from "@nou/ui";

export const FamilyInviteBenefits = (props: {
	class?: string;
	orientation?: "horizontal" | "vertical";
}) => {
	/* TODO: insert screenshots of future features:
  - shared reminders and actions
  - shared notes
  - access to doctor visits and prescriptions */
	return (
		<ul class={tw("overflow-snap-0 gap-4 [&>*]:snap-center", props.class)}>
			<li class="h-28 w-[95%] rounded-2xl bg-tertiary/15" />
			<li class="h-28 w-[95%] rounded-2xl bg-tertiary/15" />
			<li class="h-28 w-[95%] rounded-2xl bg-tertiary/15" />
		</ul>
	);
};
