const errorsDict = {
	"createPet.name.required": "El nombre es obligatorio",
	"createPet.name.length": "El nombre no debe ser demasiado corto o largo",
	"createPet.species": "Solo se permiten especies aceptables",
	"createPet.gender": "Se proporcionó un género incorrecto",
	"createPet.breed": "El nombre de esta raza parece sospechoso",
	"createPet.color": "Solo se permiten colores válidos",
	bday: "El día no es válido",
	bmonth: "El mes no es válido",
	byear: "El año no es válido",
	"birthdate.range": "La fecha no puede ser anterior a 1980 o posterior a hoy",
	"weight.range": "El peso no puede ser negativo ni demasiado alto",
	"family.name": "El nombre no puede estar vacío",
	"user.name-min": "El nombre no puede estar vacío",
	"user.name-max": "El nombre no puede exceder los 200 caracteres",
	"user.locale": "El idioma no es compatible",
	"user.measurementsSystem": "Este sistema de medición no es compatible",
} as const satisfies Record<keyof typeof import("../en/errors").default, string>;

export default errorsDict;
