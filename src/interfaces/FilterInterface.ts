import { DIFFICULTY } from "./DifficultyEnum";
import { TAG } from "./TagEnum";

export interface FilterInterface {
	timeMin: number | undefined,
	timeMax: number | undefined,
	tags: TAG[] | undefined,
	difficulty: DIFFICULTY | undefined,
	user: string | undefined,
	favorite: boolean | undefined
};