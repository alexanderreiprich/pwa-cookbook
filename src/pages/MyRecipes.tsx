import RecipeList from "../components/RecipeList";
import CreateRecipe from "../components/CreateRecipe";
import { BasePage } from "./BasePage";
import { ListConstraint } from "../interfaces/ListConstraintEnum";

function MyRecipes() {
  
  return(
    <BasePage title="Meine Rezepte">
      <CreateRecipe></CreateRecipe>
      <RecipeList constraint={ListConstraint.OWNED} />
    </BasePage>
  );
}

export default MyRecipes;