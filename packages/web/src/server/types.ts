import type { DatabaseActivity, DatabasePet, DatabaseUser } from "~/server/db/schema";

declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
export type Branded<T, B> = T & Brand<B>;

export type UserID = DatabaseUser["id"];
export type PetID = Branded<DatabasePet["id"], "PetID">;
export type ActivityID = Branded<DatabaseActivity["id"], "ActivityID">;

export type ActivityType = DatabaseActivity["type"];
export type UserMeasurementSystem = DatabaseUser["measurementSystem"];
