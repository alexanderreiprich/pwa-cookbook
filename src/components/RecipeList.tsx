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
import { ListConstraint } from "../interfaces/ListConstraintEnum";
import { sort } from "../helper/Sorting";

import '../style/RecipeList.css';

export default function RecipeList( {constraint}: {constraint: ListConstraint}) {

  const [filters, setFilters] = useState<FilterInterface>({timeMin: undefined, timeMax: undefined, tags: undefined, difficulty: undefined, user: undefined, favorite: undefined});
  const handleApplyFilters = (newFilters: FilterInterface) => {
    setFilters(newFilters);
  };

  const [recipes, setRecipes] = useState<RecipeInterface[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.NAMEASC);
  const { handleGetAllRecipes, handleGetUsersRecipes, handleGetUsersFavoriteRecipes } = useDbActionHandler();
  
  useEffect(() => {
    const fetchItems = async () => {
      let recipeList: RecipeInterface[] = [];
      switch (constraint) {
        case ListConstraint.PUBLIC : {
          recipeList = await handleGetAllRecipes(filters);
          break;
        }
        case ListConstraint.OWNED : {
          recipeList = await handleGetUsersRecipes();
          break;
        }
        case ListConstraint.FAVORED : {
          recipeList =  await handleGetUsersFavoriteRecipes();
          break;
        }
        default: {
          break;
        }
      }
      sort(recipeList, sortOrder);
      setRecipes(recipeList);
    };
    fetchItems()
  }, [filters, sortOrder]);

  return (
    <div>
      <Grid container id="btnDiv">
        <Grid item xs={6}>
          <FilterComponent onApplyFilters={handleApplyFilters}  />
        </Grid>
        <Grid item xs={6}>
          <SortComponent sortBy={sortOrder} onSortOrderChange={setSortOrder} />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        {recipes.map((recipe) => (
          <Grid key={recipe.id}id={recipe.id} item xs={6} sm={3}>
            <RecipeElement name={recipe.name} image={recipe.image} id={recipe.id} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

