import type { RouteDefinition } from "@solidjs/router";

export const route = {
	preload() {},
} satisfies RouteDefinition;

const PetPage = () => {
	return <section class="container flex flex-col gap-8">Hello world</section>;
};

export default PetPage;
