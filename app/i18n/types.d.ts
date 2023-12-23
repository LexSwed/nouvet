import resources from "./resources";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNs: "common";
		resources: typeof resources;
	}
}
