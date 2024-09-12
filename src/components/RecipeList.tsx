import RecipeElement from "../components/RecipeElement";
import "../style/BrowseRecipes.css";
import { Grid } from "@mui/material";
import FilterComponent from "../components/Filter";
import { useEffect, useState } from "react";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import SortComponent from "./Sort";
import { useDbActionHandler } from "../db/dbActionHandler";
import { FilterInterface } from "../interfaces/FilterInterface";
import { SortOrder } from "../interfaces/SortOrderEnum";
import { sort } from "../helper/Sorting";

export default function RecipeList() {

  const [filters, setFilters] = useState<FilterInterface>({timeMin: undefined, timeMax: undefined, tags: undefined, difficulty: undefined, user: undefined, favorite: undefined});
  const handleApplyFilters = (newFilters: FilterInterface) => {
    setFilters(newFilters);
  };

  const [recipes, setRecipes] = useState<RecipeInterface[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NAMEASC);
  const { handleGetAllRecipes } = useDbActionHandler();
  
  useEffect(() => {
    const fetchItems = async () => {
      let recipeList = await handleGetAllRecipes(filters);

      sort(recipeList, sortOrder);

      setRecipes(recipeList);
    };
    fetchItems()
  }, [filters, sortOrder]);

  return (
    <div>
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
  );
}

