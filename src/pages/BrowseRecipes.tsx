import NavigationBar from "../components/NavigationBar";
import RecipeList from "../components/RecipeList";

function BrowseRecipes() {
  
  return(
    <div id="root">
      <NavigationBar title="Rezepte" />
      <RecipeList />
    </div>
  );
}

export default BrowseRecipes;