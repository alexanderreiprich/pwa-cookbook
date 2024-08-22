import { db } from "..";
import { collection, query } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";
import NavigationBar from "../components/NavigationBar";
import RecipeElement from "../components/RecipeElement";

import "../style/BrowseRecipes.css";
import { Grid } from "@mui/material";

function BrowseRecipes() {
  
  const recipesCollection = collection(db, "recipes");
  const recipesQuery = query(recipesCollection);
  const { status, data:recipes } = useFirestoreCollectionData(recipesQuery, {
    idField: "id"
  });

  if (status === "loading") {
    return(
      <div id="root">
        <NavigationBar title="Rezepte" />
        <p>Rezepte werden geladen...</p>
      </div>
    );
  }

  return(
    <div id="root">
      <NavigationBar title="Rezepte" />
      <Grid container spacing={1}>
        {recipes.map((recipe) => (
          <Grid item xs={6} sm={3}>
            <RecipeElement name={recipe.name} image={recipe.image} id={recipe.id} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default BrowseRecipes;