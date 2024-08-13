import { db } from "..";
import { collection, query } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";
import NavigationBar from "../components/NavigationBar";
import RecipeElement from "../components/RecipeElement";

function BrowseRecipes() {
  
  const recipesCollection = collection(db, "recipes");
  const recipesQuery = query(recipesCollection);
  const { status, data:recipes } = useFirestoreCollectionData(recipesQuery, {
    idField: "id"
  });

  if (status === "loading") {
    return(<p>Rezepte werden geladen...</p>);
  }

  return(
    <div id="root">
      <NavigationBar title="Rezepte" />
      <div className="recipeElementContainer">
        {recipes.map((recipe) => (
          <RecipeElement name={recipe.name} image={recipe.image} id={recipe.id} />
        ))}
      </div>
    </div>
  );
}

export default BrowseRecipes;