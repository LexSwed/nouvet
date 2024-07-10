import { Card, Text, tw } from "@nou/ui";

import { createTranslator } from "~/server/i18n";

const FormErrorMessage = (props: { class?: string }) => {
	const t = createTranslator("pets");

	return (
		<Card
			variant="tonal"
			tone="primary-light"
			id="error-message"
			aria-live="polite"
			class={tw("rounded-lg bg-error-container p-2 text-on-error-container", props.class)}
		>
			<Text with="body-sm">{t("failure.title")}</Text>
		</Card>
	);
};

export { FormErrorMessage };
