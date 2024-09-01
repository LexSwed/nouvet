import { action } from "@solidjs/router";
import { createPetActivityServer } from "./activity.server";

export const createPetActivity = action(createPetActivityServer, "create-activity");
