import { Title } from "@solidjs/meta";

import { createTranslator } from "~/server/i18n";

export default function About() {
	const t = createTranslator("www");
	return (
		<>
			<Title>{t("meta.about-title")}</Title>
			About
		</>
	);
}
