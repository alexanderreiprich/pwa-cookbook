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

function SavedRecipes () {
	
  const [filters, setFilters] = useState<{ timeMin?: number; timeMax?: number; tags?: string[]; difficulty?: string }>({});
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

	const [recipes, setRecipes] = useState<RecipeInterface[]>([]);
	const [sortOrder, setSortOrder] = useState<"nameAsc" | "favsAsc" | "dateAsc" | "nameDsc" | "favsDsc" | "dateDsc">("nameAsc");

	const { currentUser } = useAuth();
	let user = currentUser ? (currentUser.displayName ? currentUser.displayName : currentUser.email) : "unknown";
	
	useEffect(() => {
		const fetchItems = async () => {
			let q: Query | CollectionReference = collection(db, "recipes");
			let s: Query | CollectionReference = collection(db, "users");
			s = query(s, where("email", "==", user));
			const savedRecipes = await getDocs(s);
			let savedRecipeList: string[] = [];
			savedRecipes.docs.map((user) => (savedRecipeList = user.get("favorites"))); 
			q = query(q, where("id", "in", savedRecipeList));

			if (filters.timeMin) {
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
        console.log(filters.difficulty);
        q = query(q, where("difficulty", "==", DIFFICULTY[filters.difficulty as keyof typeof DIFFICULTY]));
      }

			const querySnapshot = await getDocs(q);
			let recipeList: RecipeInterface[] = querySnapshot.docs.map((recipe) => ({
        id: recipe.id,
        ...recipe.data(),
      })) as RecipeInterface[];

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