interface CSSStyleDeclaration {
	"view-transition-name": string;
	"position-anchor": string;
	"inset-area": string;
}

interface Document {
	startViewTransition(
		update:
			| (() => Promise<void> | void)
			| {
					update: () => Promise<void> | void;
					types: ["slide", direction: "forwards" | "backwards"];
			  },
	): ViewTransition;
}

interface ViewTransition {
	finished: Promise<void>;
	ready: Promise<void>;
	updateCallbackDone: Promise<void>;
	skipTransition(): void;
}
