import { useEffect, useState } from "react";
import CreateRecipe from "../components/CreateRecipe";
import NavigationBar from "../components/NavigationBar";

import "../style/BrowseRecipes.css";
import { useAuth } from "../provider/Authentication";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { Grid } from "@mui/material";
import RecipeElement from "../components/RecipeElement";
import FilterComponent from "../components/Filter";
import SortComponent from "../components/Sort";
import { useDbActionHandler } from "../db/dbActionHandler";
import { FilterInterface } from "../interfaces/FilterInterface";
import { SortOrder } from "../interfaces/SortOrderEnum";
import { sort } from "../helper/Sorting";
import { USER_UNKNOWN } from "../App";

function MyRecipes () {
	
  const [filters, setFilters] = useState<FilterInterface>({timeMin: undefined, timeMax: undefined, tags: undefined, difficulty: undefined, user: undefined, favorite: undefined});
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

	const [recipes, setRecipes] = useState<RecipeInterface[]>([]);
	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NAMEASC);

	const { currentUser } = useAuth();

  const { handleGetUsersRecipes } = useDbActionHandler();

	let user = currentUser ? (currentUser.displayName ? currentUser.displayName : currentUser.email) : USER_UNKNOWN;
	
	useEffect(() => {
		const fetchItems = async () => {
		
      let recipeList: RecipeInterface[] = await handleGetUsersRecipes();

			sort(recipeList, sortOrder);

			setRecipes(recipeList);
		};
		fetchItems();
	}, [filters, sortOrder]);

	return (
		<div>
			<NavigationBar title="Meine Rezepte" />
			<CreateRecipe />
			<Grid container>
				<FilterComponent onApplyFilters={handleApplyFilters} />
				<SortComponent sortBy={sortOrder} onSortOrderChange={setSortOrder} />
			</Grid>
			<Grid container spacing={1}>
        {recipes.map((recipe) => (
          <Grid id={recipe.id}  key={recipe.id} item xs={6} sm={3}>
            <RecipeElement name={recipe.name} image={recipe.image} id={recipe.id} />
          </Grid>
        ))}
      </Grid>
		</div>
	)
}

export default MyRecipes;