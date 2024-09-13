import { Timestamp } from "firebase/firestore";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { SortOrder } from "../interfaces/SortOrderEnum";

export function sort(recipeList: RecipeInterface[], sortOrder: SortOrder): RecipeInterface[] {
	let allRecipes: RecipeInterface[] = recipeList;
	switch (sortOrder) {
		case SortOrder.NAMEASC:
			allRecipes = allRecipes.sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			break;
		case SortOrder.NAMEDSC:
			allRecipes = allRecipes.sort((a, b) =>
				b.name.localeCompare(a.name)
			);
			break;
		case SortOrder.FAVSASC:
			allRecipes = allRecipes.sort((a, b) =>
				a.favorites - b.favorites
			);
			break;
		case SortOrder.FAVSDSC:
			allRecipes = allRecipes.sort((a, b) =>
				b.favorites - a.favorites
			);
			break;
		case SortOrder.DATEASC:
			allRecipes = allRecipes.sort((a, b) => {
				let aJson = JSON.parse(JSON.stringify(a.date_create));
				let bJson = JSON.parse(JSON.stringify(b.date_create));
				let aTimestamp: Timestamp = new Timestamp(aJson.seconds, aJson.nanoseconds);
				let bTimeStamp: Timestamp = new Timestamp(bJson.seconds, bJson.nanoseconds);
				let x = new Date(aTimestamp.toDate()).getTime();
				let y = new Date(bTimeStamp.toDate()).getTime();
				return x - y;
			});
			break;
		case SortOrder.DATEDSC:
			allRecipes = allRecipes.sort((a, b) => {
				let aJson = JSON.parse(JSON.stringify(a.date_create));
				let bJson = JSON.parse(JSON.stringify(b.date_create));
				let aTimestamp: Timestamp = new Timestamp(aJson.seconds, aJson.nanoseconds);
				let bTimeStamp: Timestamp = new Timestamp(bJson.seconds, bJson.nanoseconds);
				let x = new Date(aTimestamp.toDate()).getTime();
				let y = new Date(bTimeStamp.toDate()).getTime();
				return y - x;
			});
			break;
		default:
			break;
		}
		return allRecipes;
}