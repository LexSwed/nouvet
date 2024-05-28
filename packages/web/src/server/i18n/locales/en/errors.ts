const errorsDict = {
  'createPet.name.required': 'Name is required',
  'createPet.name.length': 'Name should not be too short or too long',
  'createPet.type': 'Only valid pet types are allowed',
  'createPet.gender': 'Incorrect gender is provided',
  'createPet.breed': 'This breed name looks suspicious',
  'createPet.color': 'Only valid colors are allowed',
  'bday': 'The day is not valid',
  'bmonth': 'The month is not valid',
  'byear': 'The year is not valid',
  'birthdate.range': 'The date cannot be before 1980 or after today',
  'weight.range': 'The wight cannot be negative or too big',
  'family.name': 'Name cannot be empty',
} as const;

export default errorsDict;
