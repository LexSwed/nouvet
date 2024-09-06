import createPlugin from "tailwindcss/plugin";

const customPlugins = createPlugin(({ matchUtilities }) => {
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
	// matchVariant("part", (value) => `& [data-part="${value}"]`, {});
});

export default customPlugins;
