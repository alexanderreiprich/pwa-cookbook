import { BasePage } from "./BasePage";
import RecipeList from "../components/RecipeList";
import { ListConstraint } from "../interfaces/ListConstraintEnum";

function FavoriteRecipes () {

	return (
		<BasePage title="Favorisierte Rezepte">
			<RecipeList constraint={ListConstraint.FAVORED}></RecipeList>
		</BasePage>
	)
}

export default FavoriteRecipes;