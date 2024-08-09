const loginDict = {
	"meta.title": "NouVet | Iniciar sesión",
	"back-home": "Volver a la página de inicio",
	"hero-image": "Un gato y un perro durmiendo juntos",
	"with-facebook": "Continuar con Facebook",
} as const satisfies Record<keyof typeof import("../en/login").default, string>;

export default loginDict;
