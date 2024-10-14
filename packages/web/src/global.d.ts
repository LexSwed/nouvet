interface ImportMetaEnv {
	readonly FACEBOOK_APP_ID: string;
	readonly FACEBOOK_APP_SECRET: string;
	readonly DB: string;
}

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
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

declare module "*&imagetools" {
	/**
	 * actual types
	 * - code https://github.com/JonasKruckenberg/imagetools/blob/main/packages/core/src/output-formats.ts
	 * - docs https://github.com/JonasKruckenberg/imagetools/blob/main/docs/guide/getting-started.md#metadata
	 */
	const outputs: string;
	export default outputs;
}
