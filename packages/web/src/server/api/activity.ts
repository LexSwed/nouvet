import { action, cache } from "@solidjs/router";
import {
	createPetActivityServer,
	getPetScheduledActivitiesServer,
	listAllPetActivitiesServer,
} from "./activity.server";

export const getPetScheduledActivities = cache(
	(...args: Parameters<typeof getPetScheduledActivitiesServer>) =>
		getPetScheduledActivitiesServer(...args),
	"pet-activities-scheduled",
);

export const listAllPetActivities = cache(
	(...args: Parameters<typeof listAllPetActivitiesServer>) => listAllPetActivitiesServer(...args),
	"pet-activities",
);

export const createPetActivity = action(
	(...args: Parameters<typeof createPetActivityServer>) => createPetActivityServer(...args),
	"create-pet-activity",
);
