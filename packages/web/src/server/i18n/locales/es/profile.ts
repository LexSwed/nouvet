const profileDict = {
	"meta.title": "Perfil de usuario",
	"section.profile": "Perfil",
	"section.locale": "Localidad y Unidades",
	"setting.name": "Nombre",
	"setting.avatar": "Subir nueva imagen",
	"setting.measure-system.label": "Sistema de unidades",
	"setting.measure-system.imperial": "Imperial",
	"setting.measure-system.imperial-example": "54lbs, 7.2in",
	"setting.measure-system.metric": "Métrico",
	"setting.measure-system.metric-example": "24kg, 18cm",
	"setting.locale": "Localidad",
	"cta.save-profile": "Guardar",
	"save.success": "Perfil actualizado",
	"save.failure": "No se pudo guardar el perfil, por favor inténtelo de nuevo",
} as const satisfies Record<keyof typeof import("../en/profile").default, string>;

export default profileDict;
