import { useEffect, useState } from "react";
import CreateRecipe from "../components/CreateRecipe";
import NavigationBar from "../components/NavigationBar";

import "../style/BrowseRecipes.css";
import { collection, CollectionReference, getDocs, query, Query, where } from "firebase/firestore";
import { db } from "..";
import { useAuth } from "../components/Authentication";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { Grid } from "@mui/material";
import RecipeElement from "../components/RecipeElement";

function MyRecipes () {

	const [recipes, setRecipes] = useState<RecipeInterface[]>([]);

	const { currentUser } = useAuth();
	let user = currentUser ? (currentUser.displayName ? currentUser.displayName : currentUser.email) : "unknown";
	useEffect(() => {
		const fetchItems = async () => {
			let q: Query | CollectionReference = collection(db, "recipes");
			q = query(q, where("author", "==", user));
			const querySnapshot = await getDocs(q);
			let recipeList: RecipeInterface[] = querySnapshot.docs.map((recipe) => ({
        id: recipe.id,
        ...recipe.data(),
      })) as RecipeInterface[];

			setRecipes(recipeList);
		};
		fetchItems();
	})

	return (
		<div>
			<NavigationBar title="Deine Rezepte" />
			<CreateRecipe />
			<Grid container spacing={1}>
        {recipes.map((recipe) => (
          <Grid id={recipe.id} item xs={6} sm={3}>
            <RecipeElement name={recipe.name} image={recipe.image} id={recipe.id} />
          </Grid>
        ))}
      </Grid>
		</div>
	)
}

export default MyRecipes;