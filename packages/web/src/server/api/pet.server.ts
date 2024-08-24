"use server";

import { json, redirect } from "@solidjs/router";
import * as v from "valibot";

import { getRequestUser } from "~/server/auth/request-user";
import { type CreatePetSchema, petCreate } from "~/server/db/queries/petCreate";
import { type UpdatePetSchema, getUpdatePetSchema, petUpdate } from "~/server/db/queries/petUpdate";
import { userPets } from "~/server/db/queries/userPets";
import { jsonFailure } from "~/server/utils";

import { userPet, userPetForEdit } from "~/server/db/queries/userPet";
import { petDelete } from "../db/queries/petDelete";
import { getPetForEdit, getUserPets } from "./pet";

export async function getUserPetsServer() {
	const currentUser = await getRequestUser();
	const pets = await userPets(currentUser.userId);
	return pets;
}

export async function getPetServer(petId: string) {
	const currentUser = await getRequestUser();
	const pet = await userPet(currentUser.userId, petId);
	if (!pet) {
		throw redirect("/app/pets", { status: 404 });
	}
	return pet;
}

export async function getPetForEditServer(petId: string) {
	const currentUser = await getRequestUser();
	const pet = await userPetForEdit(currentUser.userId, petId);
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
		const petId = formData.get("petId");
		if (!petId) {
			throw new Error("petId is not provided");
		}
		const currentUser = await getRequestUser();
		const dateOfBirth = formData.get("dateOfBirth")?.toString();
		const pet = await petUpdate(
			{
				dateOfBirth: dateOfBirth && !Number.isNaN(Date.parse(dateOfBirth)) ? dateOfBirth : null,
			},
			petId.toString(),
			currentUser.userId,
		);
		return json({ pet }, { revalidate: [getUserPets.key] });
	} catch (error) {
		return jsonFailure<UpdatePetSchema>(error);
	}
}

const UpdatePetWeightSchema = v.required(v.pick(getUpdatePetSchema(), ["weight"]));
export async function updatePetWeightServer(formData: FormData) {
	try {
		const petId = formData.get("petId");
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
			petId.toString(),
			currentUser.userId,
		);
		return json({ pet }, { revalidate: [getUserPets.key] });
	} catch (error) {
		return jsonFailure<typeof UpdatePetWeightSchema>(error);
	}
}

const UpdatePetBreedSchema = v.required(v.pick(getUpdatePetSchema(), ["breed"]));
export async function updatePetBreedServer(formData: FormData) {
	try {
		const petId = formData.get("petId");
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
			petId.toString(),
			currentUser.userId,
		);
		return json({ pet }, { revalidate: [getUserPets.key] });
	} catch (error) {
		return jsonFailure<typeof UpdatePetBreedSchema>(error);
	}
}

export async function updatePetServer(formData: FormData) {
	try {
		const petId = formData.get("petId");
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
			petId.toString(),
			currentUser.userId,
		);
		return json({ pet }, { revalidate: [getUserPets.key, getPetForEdit.keyFor(pet.id)] });
	} catch (error) {
		return jsonFailure<UpdatePetSchema>(error);
	}
}

export async function deletePetServer(formData: FormData) {
	const petId = formData.get("petId");
	if (!petId) {
		return jsonFailure({
			failureReason: "other",
		});
	}
	const currentUser = await getRequestUser();
	try {
		const deletedPetId = await petDelete(petId.toString(), currentUser.userId);
		return json(
			{ petId: deletedPetId },
			{
				revalidate: [getUserPets.key, getPetForEdit.keyFor(deletedPetId)],
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
