import { useEffect, useState } from "react";
import CreateRecipe from "../components/CreateRecipe";
import NavigationBar from "../components/NavigationBar";

import "../style/BrowseRecipes.css";
import { collection, CollectionReference, getDocs, query, Query, Timestamp, where } from "firebase/firestore";
import { db } from "..";
import { useAuth } from "../components/Authentication";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { Grid } from "@mui/material";
import RecipeElement from "../components/RecipeElement";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { TAG } from "../interfaces/TagEnum";
import FilterComponent from "../components/Filter";
import SortComponent from "../components/Sort";
import { FilterInterface } from "../interfaces/FilterInterface";
import { useRecipeActions } from "../db/useRecipes";
import { sort } from "../helpers/Sorting";
import { SortOrder } from "../interfaces/SortOrderEnum";

function SavedRecipes () {
	
  const [filters, setFilters] = useState<FilterInterface>({timeMin: undefined, timeMax: undefined, tags: undefined, difficulty: undefined, user: undefined, favorite: undefined});
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

	const [recipes, setRecipes] = useState<RecipeInterface[]>([]);
	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NAMEASC);

	const { currentUser } = useAuth();
	let user = currentUser ? (currentUser.displayName ? currentUser.displayName : currentUser.email) : "unknown";
	
  const { handleGetUsersSavedRecipes } = useRecipeActions();

	useEffect(() => {
		const fetchItems = async () => {

      let recipeList: RecipeInterface[] = await handleGetUsersSavedRecipes();
			
      sort(recipeList, sortOrder);

      setRecipes(recipeList);
		};
		fetchItems();
	}, [filters, sortOrder]);

	return (
		<div>
			<NavigationBar title="Deine Rezepte" />
			<CreateRecipe />
			<Grid container>
        <FilterComponent onApplyFilters={handleApplyFilters} />
        <SortComponent sortBy={sortOrder} onSortOrderChange={setSortOrder} />
      </Grid>
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

export default SavedRecipes;