import { Icon, RadioCard, type SvgIcons, Text, tw } from "@nou/ui";
import { type ComponentProps, For, createUniqueId } from "solid-js";

import { createTranslator } from "~/server/i18n";

import css from "./species-selector.module.css";

interface SpeciesSelectorProps {
	/** input radio element name attribute for species */
	name: string;
}

const SpeciesSelector = (props: SpeciesSelectorProps) => {
	const t = createTranslator("pets");
	const species = (): Array<{
		value: string;
		label: string;
		icon: SvgIcons;
	}> => [
		{
			value: "dog",
			label: t("animal-type.dog")!,
			icon: "dog",
		},
		{
			value: "cat",
			label: t("animal-type.cat")!,
			icon: "cat",
		},
		{
			value: "bird",
			label: t("animal-type.bird")!,
			icon: "bird",
		},
		{
			value: "rabbit",
			label: t("animal-type.rabbit")!,
			icon: "rabbit",
		},
		{
			value: "rodent",
			label: t("animal-type.rodent")!,
			icon: "rodent",
		},
		{
			value: "horse",
			label: t("animal-type.horse")!,
			icon: "horse",
		},
	];

	return (
		<div class={"overflow-snap -m-4 flex w-[stretch] scroll-px-4 gap-2 p-4"}>
			<For each={species()}>
				{(item) => {
					return (
						<RadioCard
							class="basis-[8.5rem] snap-start will-change-[flex-basis] last-of-type:snap-end has-[input:checked]:basis-[9.25rem]"
							name={props.name}
							value={item.value}
							label={item.label}
							icon={<Icon size="sm" use={item.icon} />}
						/>
					);
				}}
			</For>
		</div>
	);
};

const GenderSwitch = (props: { name: string; value: "male" | "female" | null | undefined }) => {
	const t = createTranslator("pets");
	const id = createUniqueId();
	return (
		<fieldset class={tw(css.genderSwitch, "flex flex-col gap-2")} aria-labelledby={id}>
			<Text with="label-sm" as="label" id={id} class="ms-2">
				{t("animal-gender")}
			</Text>
			<div class={tw(css.genderWrapper, "grid grid-cols-[1fr,auto,1fr] items-center gap-2")}>
				<RadioCard
					name={props.name}
					value="male"
					checked={props.value === "male"}
					label={t("animal-gender.male")!}
					class={tw(css.genderSwitchCard, "h-16")}
				/>
				<SvgGender class={tw(css.genderIcon, "relative mt-1 size-10")} aria-hidden />
				<RadioCard
					name={props.name}
					value="female"
					checked={props.value === "female"}
					label={t("animal-gender.female")!}
					class={tw(css.genderSwitchCard, "h-16")}
				/>
			</div>
		</fieldset>
	);
};

const SvgGender = (props: ComponentProps<"svg">) => {
	return (
		<svg viewBox="0 0 236 272" role="presentation" xmlns="http://www.w3.org/2000/svg" {...props}>
			<defs />
			<circle cx="116" cy="120" r="72" fill="currentColor" opacity="0.2" />
			<circle
				cx="116"
				cy="120"
				r="72"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="16"
			/>
			<g data-male>
				<line
					x1="166.91"
					y1="69.09"
					x2="228"
					y2="8"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="16"
				/>
				<polyline
					points="180 8 228 8 228 56"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="16"
				/>
			</g>
			<g data-female>
				<line
					x1="116"
					y1="192"
					x2="116"
					y2="264"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="16"
				/>
				<line
					x1="76"
					y1="232"
					x2="156"
					y2="232"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="16"
				/>
			</g>
		</svg>
	);
};

export { SpeciesSelector, GenderSwitch };
