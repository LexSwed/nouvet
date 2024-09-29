import { action, cache } from "@solidjs/router";
import { createPetActivityServer, listAllPetActivitiesServer } from "./activity.server";

export const listAllPetActivities = cache(listAllPetActivitiesServer, "create-pet-activity");

export const createPetActivity = action(createPetActivityServer, "create-pet-activity");
