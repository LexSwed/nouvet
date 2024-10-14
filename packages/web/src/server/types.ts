import type {
	DatabaseActivity,
	DatabasePet,
	DatabasePrescription,
	DatabaseUser,
} from "~/server/db/schema";

export type UserID = DatabaseUser["id"];
export type PetID = DatabasePet["id"];
export type ActivityID = DatabaseActivity["id"];

export type ActivityType = DatabaseActivity["type"];
export type UserMeasurementSystem = DatabaseUser["measurementSystem"];

export type PetSpecies = DatabasePet["species"];
export type PetGender = DatabasePet["gender"];

declare const __brand: unique symbol;
export type Brand<B> = { [__brand]: B };
export type Branded<T, B> = T & Brand<B>;

export type PrescriptionMedicationType = NonNullable<DatabasePrescription["schedule"]>["type"];

export type PetActivitiesPaginationCursor = Branded<string, "PetActivitiesPaginationCursor">;

export type { UserSession } from "~/server/auth/user-session";
