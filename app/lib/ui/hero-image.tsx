import type { ImgHTMLAttributes } from "react";
import { tw } from "./tw.ts";

export function HeroImage(
	props: Omit<ImgHTMLAttributes<HTMLImageElement>, "src">,
) {
	return (
		<img
			{...props}
			src="https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
			className={tw(
				"aspect-[9/12] h-full w-full bg-primary/5 object-cover",
				props.className,
			)}
		/>
	);
}
