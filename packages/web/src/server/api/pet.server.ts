"use server";

import { json, redirect } from "@solidjs/router";
import * as v from "valibot";

import { getRequestUser } from "~/server/auth/request-user";
import { type CreatePetSchema, petCreate } from "~/server/db/queries/pet-create";
import { UpdatePetSchema, petUpdate } from "~/server/db/queries/pet-update";
import { userPets } from "~/server/db/queries/user-pets";
import { jsonFailure } from "~/server/utils";

import { userPet } from "~/server/db/queries/user-pet";
import { petDelete } from "../db/queries/pet-delete";
import type { PetID } from "../types";
import { getPet, getUserPets } from "./pet";

export async function getUserPetsServer() {
	const currentUser = await getRequestUser();
	const pets = await userPets(currentUser.userId);
	return pets;
}

export async function getPetServer(petId: PetID) {
	const currentUser = await getRequestUser();
	const pet = await userPet(currentUser.userId, petId);
	if (!pet) {
		throw redirect("/app/pets", { status: 404 });
	}
	return pet;
}

export async function createPetServer(formData: FormData) {
	const currentUser = await getRequestUser();
	try {
		const pet = await petCreate(
			{
				name: formData.get("name"),
				species: formData.get("species"),
				gender: formData.get("gender"),
			},
			currentUser.userId,
		);
		return json({ pet }, { revalidate: [getUserPets.key] });
	} catch (error) {
		return jsonFailure<CreatePetSchema>(error);
	}
}

export async function updatePetBirthDateServer(formData: FormData) {
	try {
		const petId = formData.get("petId")?.toString();
		if (!petId) {
			throw new Error("petId is not provided");
		}
		const currentUser = await getRequestUser();
		const dateOfBirth = formData.get("dateOfBirth")?.toString();
		const pet = await petUpdate(
			{
				dateOfBirth: dateOfBirth && !Number.isNaN(Date.parse(dateOfBirth)) ? dateOfBirth : null,
			},
			petId as PetID,
			currentUser.userId,
		);
		return json({ pet }, { revalidate: [getUserPets.key] });
	} catch (error) {
		return jsonFailure<typeof UpdatePetSchema>(error);
	}
}

const UpdatePetWeightSchema = v.required(v.pick(UpdatePetSchema, ["weight"]));
export async function updatePetWeightServer(formData: FormData) {
	try {
		const petId = formData.get("petId")?.toString();
		if (!petId) {
			throw new Error("petId is not provided");
		}
		const { weight } = v.parse(UpdatePetWeightSchema, {
			weight: formData.get("weight"),
		});
		const currentUser = await getRequestUser();
		const pet = await petUpdate(
			{
				weight,
			},
			petId as PetID,
			currentUser.userId,
		);
		return json({ pet }, { revalidate: [getUserPets.key] });
	} catch (error) {
		return jsonFailure<typeof UpdatePetWeightSchema>(error);
	}
}

const UpdatePetBreedSchema = v.required(v.pick(UpdatePetSchema, ["breed"]));
export async function updatePetBreedServer(formData: FormData) {
	try {
		const petId = formData.get("petId")?.toString();
		if (!petId) {
			throw new Error("petId is not provided");
		}
		const { breed } = v.parse(UpdatePetBreedSchema, {
			breed: formData.get("breed"),
		});
		const currentUser = await getRequestUser();
		const pet = await petUpdate(
			{
				breed,
			},
			petId as PetID,
			currentUser.userId,
		);
		return json({ pet }, { revalidate: [getUserPets.key] });
	} catch (error) {
		return jsonFailure<typeof UpdatePetBreedSchema>(error);
	}
}

export async function updatePetServer(formData: FormData) {
	try {
		const petId = formData.get("petId")?.toString();
		if (!petId) {
			throw new Error("petId is not provided");
		}
		const currentUser = await getRequestUser();
		const dateOfBirth = formData.get("dateOfBirth")?.toString();
		const pet = await petUpdate(
			{
				name: formData.get("name") ?? undefined,
				gender: formData.get("gender") ?? undefined,
				color: formData.get("color") ?? undefined,
				dateOfBirth: dateOfBirth && !Number.isNaN(Date.parse(dateOfBirth)) ? dateOfBirth : null,
				breed: formData.get("breed") ?? undefined,
			},
			petId as PetID,
			currentUser.userId,
		);
		return json({ pet }, { revalidate: [getUserPets.key, getPet.keyFor(pet.id)] });
	} catch (error) {
		return jsonFailure<typeof UpdatePetSchema>(error);
	}
}

export async function deletePetServer(formData: FormData) {
	const petId = formData.get("petId")?.toString();
	if (!petId) {
		throw new Error("petId is not provided");
	}
	const currentUser = await getRequestUser();
	try {
		const deletedPetId = await petDelete(petId as PetID, currentUser.userId);
		return json(
			{ petId: deletedPetId },
			{
				revalidate: [getUserPets.key, getPet.keyFor(deletedPetId)],
				headers: {
					Location: "/app/pets",
				},
				status: 302,
			},
		);
	} catch (error) {
		return jsonFailure(error);
	}
}
