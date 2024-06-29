import type { ComponentProps } from "solid-js";

import { tw } from "./tw";

const Divider = (props: ComponentProps<"div">) => {
	return (
		<div
			// biome-ignore lint/a11y/useAriaPropsForRole: <explanation>
			role="separator"
			{...props}
			class={tw("mx-4 border-on-surface/12 border-t-[1px]", props.class)}
		/>
	);
};

export { Divider };
