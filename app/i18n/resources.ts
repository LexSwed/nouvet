import enApp from "../../public/locales/en/app.json";
import enCommon from "../../public/locales/en/common.json";
import enLogin from "../../public/locales/en/login.json";
import enWWW from "../../public/locales/en/www.json";

const resources = {
	common: enCommon,
	www: enWWW,
	app: enApp,
	login: enLogin,
} as const;

export default resources;
