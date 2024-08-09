const wwwDict = {
	headline: "El bienestar de tu mascota <br> Asegurado",
	subheadline: "Mantén a tu mascota sana y feliz, sin olvidar ningún detalle de su bienestar",
	"open-main-app": "Abrir aplicación",
	"cta-start": "Empezar",
	features: "Funcionalidades",
	"link-about-the-project": "Acerca de",
	"link-privacy-policy": "Política de privacidad",
	"hero-image": "Un gato y un perro durmiendo juntos",
	"heading-features": "Funcionalidades",
	"feature-medical-history": "Lleva el historial médico de tu mascota",
	"feature-share-reminders": "Comparte los recordatorios con tu familia",
	"feature-connect-veterinaries": "Conecta con veterinarios cerca de ti",
	"meta.main-title": "NouVet para el bienestar de las mascotas",
	"meta.about-title": "Acerca de NouVet",
	"meta.privacy-title": "Política de privacidad de NouVet",
} as const satisfies Record<keyof typeof import("../en/www").default, string>;

export default wwwDict;
