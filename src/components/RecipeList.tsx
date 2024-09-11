import { Timestamp } from "firebase/firestore";
import RecipeElement from "../components/RecipeElement";
import "../style/BrowseRecipes.css";
import { Grid } from "@mui/material";
import FilterComponent from "../components/Filter";
import { useEffect, useState } from "react";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import SortComponent from "./Sort";
import { useRecipeActions } from "../db/useRecipes";
import { FilterInterface } from "../interfaces/FilterInterface";

export default function RecipeList() {

  const [filters, setFilters] = useState<FilterInterface>({timeMin: undefined, timeMax: undefined, tags: undefined, difficulty: undefined, user: undefined, favorite: undefined});
  const handleApplyFilters = (newFilters: FilterInterface) => {
    setFilters(newFilters);
  };

  const [recipes, setRecipes] = useState<RecipeInterface[]>([]);
  const [sortOrder, setSortOrder] = useState<"nameAsc" | "favsAsc" | "dateAsc" | "nameDsc" | "favsDsc" | "dateDsc">("nameAsc");
  const { handleGetAllRecipes } = useRecipeActions();
  
  useEffect(() => {
    const fetchItems = async () => {
      let recipeList = await handleGetAllRecipes(filters);

      switch(sortOrder) {
        case "nameAsc":
          recipeList = recipeList.sort((a, b) => 
            a.name.localeCompare(b.name)
          );
          break;
        case "nameDsc":
          recipeList = recipeList.sort((a, b) => 
            b.name.localeCompare(a.name)
          );
          break;
        case "favsAsc":
          recipeList = recipeList.sort((a, b) => 
            a.favorites - b.favorites
          );
          break;
        case "favsDsc":
          recipeList = recipeList.sort((a, b) => 
            b.favorites - a.favorites
          );
          break;
        case "dateAsc":
          recipeList = recipeList.sort((a, b) => {
            let aJson = JSON.parse(JSON.stringify(a.date_create));
            let bJson = JSON.parse(JSON.stringify(b.date_create));
            let aTimestamp: Timestamp = new Timestamp(aJson.seconds, aJson.nanoseconds);
            let bTimeStamp: Timestamp = new Timestamp(bJson.seconds, bJson.nanoseconds);
            let x = new Date(aTimestamp.toDate()).getTime();
            let y = new Date(bTimeStamp.toDate()).getTime();
            return x - y;
          });
          break;
        case "dateDsc":
          recipeList = recipeList.sort((a, b) => {
            let aJson = JSON.parse(JSON.stringify(a.date_create));
            let bJson = JSON.parse(JSON.stringify(b.date_create));
            let aTimestamp: Timestamp = new Timestamp(aJson.seconds, aJson.nanoseconds);
            let bTimeStamp: Timestamp = new Timestamp(bJson.seconds, bJson.nanoseconds);
            let x = new Date(aTimestamp.toDate()).getTime();
            let y = new Date(bTimeStamp.toDate()).getTime();
            return y - x;
          });
          break;
        default:
          break;
      }      

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

