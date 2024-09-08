import FavoriteIcon from '@mui/icons-material/Favorite';
import { Button, Grid } from "@mui/material";
import { doc } from "firebase/firestore";
import { Key } from "react";
import { useSearchParams } from "react-router-dom";
import { useFirestoreDocData } from "reactfire";
import { db } from "..";
import EditRecipe from "../components/EditRecipe";
import NavigationBar from "../components/NavigationBar";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import { TAG } from "../interfaces/TagEnum";
import "../style/Images.css";
import { useAuth } from '../components/Authentication';

function Recipe() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const ref = doc(db, "recipes", id!);
  const { status, data: recipe } = useFirestoreDocData(ref);

  const { currentUser } = useAuth();
	let user = currentUser ? (currentUser.displayName ? currentUser.displayName : currentUser.email) : "unknown";


  if( !recipe || status === "error") {
    return (
      <div>
      <NavigationBar title="Rezepte" />
        <p>Rezept konnte leider nicht geladen werden...</p>
      </div>
    )
      
  }
  if (status === "loading") {
    return (
      <div>
      <NavigationBar title="Rezepte" />
        <p>Rezept wird geladen...</p>
      </div>
    )
  }

  return (
    <div>
      <NavigationBar title="Rezepte" />
      <Grid container spacing={10} justifyContent="center" paddingTop={3} paddingBottom={3}>
        <Grid item id="recipeHead" xs={10} md={5}>
          <h1>{recipe.name}</h1>
          <div>
            <div><i>von: {recipe.author}</i></div>
            <div>erstellt am: {new Date(recipe.date_create.seconds * 1000 + recipe.date_create.nanoseconds / 1000000).toDateString()}</div>
          </div>
          <div>
            <Button style={{ paddingLeft: 0, marginLeft: 0, minWidth: 0 }}>{DIFFICULTY[recipe.difficulty]}</Button>
            {recipe.tags.map((tag: TAG) => <Button> {TAG[tag]}</Button>)}
            <Button color="secondary" startIcon={<FavoriteIcon />}>{recipe.favorites}</Button>
          </div>
          <p> Dauer: {recipe.time} min</p>
          <p>{recipe.description}</p>
        </Grid>
        <Grid item id="recipeImage" xs={10} md={5}>
          {recipe.author == user ? (<EditRecipe recipe={recipe} isNew={false}></EditRecipe>) : null}
          <div id="recipeImgContainer">
            <img className="image" src={recipe.image} />
          </div>
        </Grid>
        <Grid item id="recipeContent" xs={10}>
          <h2>Zutaten</h2>
          <p>Anzahl der Personen: {recipe.number_of_people}</p>
          <ul >
            {recipe.ingredients.map((ingredient: IngredientInterface) =>
              <li key={ingredient.name as Key}>{ingredient.name} {ingredient.amount} {ingredient.unit}</li>
            )}
          </ul>
          <h2>Schritte</h2>
          <ol >
            {recipe.steps.map((value: String) => <li key={value as Key}>{value}</li>)}
          </ol>
        </Grid>
      </Grid>
    </div>
  );
}

export default Recipe;
