// @ts-check
import createPlugin from "tailwindcss/plugin";

const customPlugins = createPlugin(({ theme, addVariant, matchVariant, matchUtilities }) => {
	addVariant("intent", ["&:where(:hover,:focus)"]);
	addVariant("disabled", ['&:where(disabled,[aria-disabled="true"])']);
	matchUtilities({
		"view-transition": (value) => ({
			viewTransitionName: value,
		}),
		"view-transition-class": (value) => ({
			viewTransitionClass: value,
		}),
	});
	matchUtilities({
		anchor: (value) => ({
			anchorName: value,
		}),
		"to-anchor": (value) => ({
			positionAnchor: value,
		}),
	});
	addVariant("starting", "@starting-style");
	addVariant("popover-open", "&:popover-open");
	matchVariant("part", (value) => `& [data-part="${value}"]`, {});

	matchUtilities(
		{
			"overflow-snap": (value) => {
				return {
					display: "flex",
					"flex-direction": "row",
					"flex-wrap": "nowrap",
					"scrollbar-width": "none",
					"margin-block": `calc(-1*${theme("spacing.2")})`,
					"padding-block": `${theme("spacing.2")}`,
					"scroll-snap-type": "x mandatory",
					"overflow-x": "auto",
					"&>:last-of-type": {
						"scroll-snap-align": "end",
					},
					"&>*": {
						"flex-shrink": "0",
						"scroll-snap-align": "start",
						"scroll-snap-stop": "always",
					},
					"margin-inline": `calc(-1*${value})`,
					"padding-inline": `${value}`,
					"scroll-padding-inline": `${value}`,
				};
			},
		},
		{ values: theme("spacing") },
	);
});

export default customPlugins;
