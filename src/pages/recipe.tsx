import { doc} from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import { db } from "..";
import { useFirestoreDocData } from "reactfire";
import NavigationBar from "../components/NavigationBar";
import { Button, Grid } from "@mui/material";
import "../style/Images.css";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import { TAG } from "../interfaces/TagEnum";
import FavoriteIcon from '@mui/icons-material/Favorite';

function Recipe() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const ref = doc(db, "recipes", id!);
  const { status, data: recipe } = useFirestoreDocData(ref);

  if (status === "loading") {
    return <p>Rezept wird geladen...</p>
  }
  return (
    <div id="root">
      <NavigationBar title="Rezepte"/>
      <Grid container spacing={10} justifyContent="center" paddingTop={3} paddingBottom={3}>
        <Grid item id="recipeHead" xs={10} md={5}>
          <h1>{recipe.name}</h1>
          <p>
            <div><i>von: {recipe.author}</i></div>
            <div>erstellt am: {new Date(recipe.date_create.seconds * 1000 + recipe.date_create.nanoseconds/1000000).toDateString()}</div>
          </p>
          <p>
            <Button style={{paddingLeft: 0, marginLeft: 0, minWidth: 0}}>{DIFFICULTY[recipe.difficulty]}</Button>
            <Button>{recipe.tags.map((tag: TAG) => TAG[tag])}</Button>
            <Button color="secondary" startIcon={<FavoriteIcon />}>{recipe.favorites}</Button>
          </p>
          <p> Dauer: {recipe.time} min</p>
          <p>{recipe.description}</p>
        </Grid>
        <Grid item id="recipeImage" xs={10} md={5}>
          <div id="recipeImgContainer">
            <img className="image" src={recipe.image} />
          </div>
        </Grid>
        <Grid item id="recipeImage" xs={10}>
          <h2>Zutaten</h2>
          <p>Anzahl der Personen: {recipe.number_of_people}</p>
          <ul >
            {recipe.ingredients.map((ingredient: IngredientInterface) => 
              <li>{ingredient.name} {ingredient.amount} {ingredient.unit}</li>
            )}
          </ul>
          <h2>Schritte</h2>
          <ol >
            {recipe.steps.map((value: String) => <li>{value}</li>)}
          </ol>
        </Grid>
      </Grid>
    </div>
  );
}

export default Recipe;