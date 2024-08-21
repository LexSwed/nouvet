"use server";

import { json, redirect } from "@solidjs/router";
import * as v from "valibot";

import { getRequestUser } from "~/server/auth/request-user";
import { petCreate } from "~/server/db/queries/petCreate";
import { getUpdatePetSchema, petUpdate } from "~/server/db/queries/petUpdate";
import { userPets } from "~/server/db/queries/userPets";
import { type ErrorKeys, translateErrorTokens } from "~/server/utils";

import { jsonFailure } from "~/lib/utils/submission";
import { userPet, userPetForEdit } from "~/server/db/queries/userPet";
import { getUserPets } from "./pet";

export const getUserPetsServer = async () => {
	const currentUser = await getRequestUser();
	const pets = await userPets(currentUser.userId);
	return pets;
};

export const getPetServer = async (petId: string) => {
	const currentUser = await getRequestUser();
	const pet = await userPet(currentUser.userId, petId);
	if (!pet) {
		throw redirect("/app/pets", { status: 404 });
	}
	return pet;
};

export const getPetForEditServer = async (petId: string) => {
	const currentUser = await getRequestUser();
	const pet = await userPetForEdit(currentUser.userId, petId);
	if (!pet) {
		throw redirect("/app/pets", { status: 404 });
	}
	return pet;
};

export const createPetServer = async (formData: FormData) => {
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
		if (v.isValiError(error)) {
			return jsonFailure({
				failureReason: "validation",
				errors: await translateErrorTokens(error),
			});
		}
		console.error(error);
		return jsonFailure({ failureReason: "other" });
	}
};

const PetBirthDaySchema = v.pipe(
	v.object({
		bday: v.nullish(
			v.config(
				v.pipe(v.unknown(), v.transform(Number), v.number(), v.minValue(1), v.maxValue(31)),
				{
					message: "bday" satisfies ErrorKeys,
				},
			),
			1,
		),
		bmonth: v.nullish(
			v.config(
				v.pipe(v.unknown(), v.transform(Number), v.number(), v.minValue(0), v.maxValue(11)),
				{ message: "bmonth" satisfies ErrorKeys },
			),
			0,
		),
		byear: v.config(
			v.pipe(
				v.unknown(),
				v.transform(Number),
				v.number(),
				v.minValue(1980),
				v.maxValue(new Date().getFullYear()),
			),
			{ message: "byear" satisfies ErrorKeys },
		),
	}),
	// check the day selected is not overflowing the month
	v.check((birthDate) => {
		const dateOfBirth = new Date(Date.UTC(birthDate.byear, birthDate.bmonth, birthDate.bday));
		return dateOfBirth.getDate() === birthDate.bday && dateOfBirth.getMonth() === birthDate.bmonth;
	}, "bday" satisfies ErrorKeys),
	v.transform((birthDate) => new Date(Date.UTC(birthDate.byear, birthDate.bmonth, birthDate.bday))),
	v.date("bday" satisfies ErrorKeys),
);

export const updatePetBirthDateServer = async (formData: FormData) => {
	try {
		const petId = formData.get("petId");
		if (!petId) {
			throw new Error("petId is not provided");
		}
		const dateOfBirth = v.parse(PetBirthDaySchema, {
			bday: formData.get("bday"),
			bmonth: formData.get("bmonth"),
			byear: formData.get("byear"),
		});
		const currentUser = await getRequestUser();
		const pet = await petUpdate(
			{
				dateOfBirth,
			},
			petId.toString(),
			currentUser.userId,
		);
		return json({ pet }, { revalidate: [getUserPets.key] });
	} catch (error) {
		if (v.isValiError(error)) {
			return jsonFailure({
				failureReason: "validation",
				errors: await translateErrorTokens(error),
			});
		}
		console.error(error);
		return jsonFailure({ failureReason: "other" });
	}
};

export const updatePetWeightServer = async (formData: FormData) => {
	try {
		const petId = formData.get("petId");
		if (!petId) {
			throw new Error("petId is not provided");
		}
		const { weight } = v.parse(v.required(v.pick(getUpdatePetSchema(), ["weight"])), {
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
		if (v.isValiError(error)) {
			return jsonFailure({
				failureReason: "validation",
				errors: await translateErrorTokens(error),
			});
		}
		console.error(error);
		return jsonFailure({ failureReason: "other" });
	}
};

export const updatePetBreedServer = async (formData: FormData) => {
	try {
		const petId = formData.get("petId");
		if (!petId) {
			throw new Error("petId is not provided");
		}
		const { breed } = v.parse(v.required(v.pick(getUpdatePetSchema(), ["breed"])), {
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
		if (v.isValiError(error)) {
			return jsonFailure({
				failureReason: "validation",
				errors: await translateErrorTokens(error),
			});
		}
		console.error(error);
		return jsonFailure({ failureReason: "other" });
	}
};

export const updatePetServer = async (formData: FormData) => {
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
		return json({ pet }, { revalidate: [getUserPets.key] });
	} catch (error) {
		if (v.isValiError<ReturnType<typeof getUpdatePetSchema>>(error)) {
			return jsonFailure({
				failureReason: "validation",
				errors: await translateErrorTokens(error),
			});
		}
		console.error(error);
		return jsonFailure({ failureReason: "other" });
	}
};
