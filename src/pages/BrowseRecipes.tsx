import RecipeList from "../components/RecipeList";
import { BasePage } from "./BasePage";
import { ListConstraint } from "../interfaces/ListConstraintEnum";

function BrowseRecipes() {
  return (
    <BasePage title="Rezepte durchsuchen">
      <RecipeList constraint={ListConstraint.PUBLIC} />
    </BasePage>
  );
}

export default BrowseRecipes;
