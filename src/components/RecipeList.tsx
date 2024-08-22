import { db } from "..";
import { collection, CollectionReference, getDocs, Query, query, where } from "firebase/firestore";
import RecipeElement from "../components/RecipeElement";

import "../style/BrowseRecipes.css";
import { Grid } from "@mui/material";
import FilterComponent from "../components/Filter";
import { useEffect, useState } from "react";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { TAG } from "../interfaces/TagEnum";

export default function RecipeList() {

  const [filters, setFilters] = useState<{ timeMin?: number; timeMax?: number; tags?: string[]; difficulty?: string[] }>({});
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const [recipes, setRecipes] = useState<RecipeInterface[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      let q: Query | CollectionReference = collection(db, "recipes");
      if (filters.timeMin) {
        console.log(typeof filters.timeMin);
        q = query(q, where("time", ">=", Number(filters.timeMin)));
      }
      if (filters.timeMax) {
        q = query(q, where("time", "<=", Number(filters.timeMax)));
      }
      if (filters.tags && filters.tags?.length > 0) {
        let chosenTags = []
        for (let i = 0; i < filters.tags?.length; i++) {
          chosenTags.push(TAG[filters.tags[i] as keyof typeof TAG]);
        }
        q = query(q, where("tags", "array-contains-any", chosenTags))
      }
      if (filters.difficulty && filters.difficulty?.length > 0) {
        q = query(q, where("difficulty", "==", DIFFICULTY[filters.difficulty[0] as keyof typeof DIFFICULTY]));
      }
      const querySnapshot = await getDocs(q);
      const recipeList: RecipeInterface[] = querySnapshot.docs.map((recipe) => ({
        id: recipe.id,
        ...recipe.data(),
      })) as RecipeInterface[];
      setRecipes(recipeList);
    };
    fetchItems()
  }, [filters]);

  return (
    <div id="root">
      <FilterComponent onApplyFilters={handleApplyFilters} />
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

