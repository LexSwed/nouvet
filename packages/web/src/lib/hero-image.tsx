import { tw } from "@nou/ui";
import type { JSX } from "solid-js";

export function HeroImage(props: JSX.ImgHTMLAttributes<HTMLImageElement>) {
	return (
		<img
			src="/assets/images/alec-favale-Ivzo69e18nk-unsplash.jpg?w=600&format=webp&imagetools"
			class={tw("aspect-[9/12] h-full w-full bg-primary/5 object-cover", props.class)}
			{...props}
			alt={props.alt}
		/>
	);
}
