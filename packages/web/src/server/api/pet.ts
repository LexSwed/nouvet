import { action, cache } from "@solidjs/router";

import {
	createPetServer,
	deletePetServer,
	getPetServer,
	getUserPetsServer,
	updatePetBirthDateServer,
	updatePetBreedServer,
	updatePetServer,
	updatePetWeightServer,
} from "./pet.server";

export const getUserPets = cache(getUserPetsServer, "user-pets");

export const createPet = action(createPetServer, "create-pet");

export const updatePetBirthDate = action(updatePetBirthDateServer, "update-pet-birth-date");

export const updatePetWeight = action(updatePetWeightServer, "update-pet-weight");

export const updatePetBreed = action(updatePetBreedServer, "update-pet-breed");

export const updatePet = action(updatePetServer, "update-pet");

export const getPet = cache(getPetServer, "user-pet");

export const deletePet = action(deletePetServer, "delete-pet");
