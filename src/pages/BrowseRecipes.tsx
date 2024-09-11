import NavigationBar from "../components/NavigationBar";
import RecipeList from "../components/RecipeList";
import CreateRecipe from "../components/CreateRecipe";

function BrowseRecipes() {
  
  return(
    <div>
      <NavigationBar title="Alle Rezepte durchsuchen" />
      <CreateRecipe></CreateRecipe>
      <RecipeList />
    </div>
  );
}

export default BrowseRecipes;