import {
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { Key, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import { TAG } from "../interfaces/TagEnum";
import "../style/Images.css";
import FavoritesButton from "../components/FavoritesButton";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { formatDate } from "../helpers/templateHelper";
import { useRecipeActions } from "../db/useRecipes";
import { useNetworkStatus } from "../helpers/NetworkStatusProvider";
import EditRecipe from "../components/EditRecipe";


function Recipe() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<RecipeInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean>(false);
  const { handleGetRecipeById, handleChangeRecipeVisibility } = useRecipeActions();
  const { isOnline } = useNetworkStatus();

  const handleVisibilityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (id) {
      handleChangeRecipeVisibility(id);
      setChecked(!checked);
    }
  };

  const [servings, setServings] = useState<number>(4);
  const handleServingsChange = (event: any) => {
    const newServings = Number(event.target.value);
    setServings(newServings);
  }

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        if (id) {
          const recipe = await handleGetRecipeById(id);
          setRecipe(recipe);
          
          setChecked(recipe!.public);
          setServings(recipe!.number_of_people)
        } else {
          setError("Fehler beim Abrufen der Id des Rezepts.");
        }
      } catch (err) {
        setError("Fehler beim Abrufen des Rezepts.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);
  
  if (loading) {
    return (
      <div>
        <NavigationBar title="Rezepte" />
        <p>Rezept wird geladen...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <NavigationBar title="Rezepte" />
        <p>{error}</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div>
        <NavigationBar title="Rezepte" />
        <p>Rezept konnte leider nicht geladen werden...</p>
      </div>
    );
  }

  const adjustedIngredients = recipe.ingredients.map(ingredient => {
    return {
      ...ingredient,
      amount: (ingredient.amount / recipe.number_of_people) * servings
    };
  })
  
  return (
    <div>
      <NavigationBar title="Rezepte" />
      <Grid
        container
        spacing={10}
        justifyContent="center"
        paddingTop={3}
        paddingBottom={3}
      >
        <Grid item id="recipeHead" xs={10} md={5}>
          <h1>{recipe.name}</h1>
          <div>
            <div>
              <i>von: {recipe.author}</i>
            </div>
            <div>erstellt am: {formatDate(recipe.date_create)}</div>
          </div>
          {isOnline ? (
            <div>
              <FormGroup
                sx={{
                  borderRadius: 2,
                  borderColor: "#000000",
                  borderWidth: "1px",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <b>Privat</b>
                  <Switch
                    onChange={handleVisibilityChange}
                    checked={checked}
                  />
                  <b>Öffentlich</b>
                </Stack>
              </FormGroup>
            </div>
          ) : null}
          <div>
            <Button style={{ paddingLeft: 0, marginLeft: 0, minWidth: 0 }}>{DIFFICULTY[recipe.difficulty]}</Button>
            {recipe.tags.map((tag: TAG) => <Button> {TAG[tag]}</Button>)}
            <FavoritesButton recipe={recipe} favorites={recipe.favorites}/>
          </div>
          <p> Dauer: {recipe.time} min</p>
          <p>{recipe.description}</p>
        </Grid>
        <Grid item id="recipeImage" xs={10} md={5}>
        <EditRecipe recipe={recipe} isNew={false}></EditRecipe>
          <div id="recipeImgContainer">
            <img className="image" src={recipe.image} />
          </div>
        </Grid>
        <Grid item id="recipeContent" xs={10}>
          <h2>Zutaten</h2>

          <p>Anzahl der Personen: 
            <Box sx={{padding: 3}}>
              <TextField type="number" size="small" value={servings} onChange={handleServingsChange} inputProps={{min: 1}} sx={{width: '100px'}} />
            </Box>
          </p>
          <ul>
            {adjustedIngredients.map((ingredient: IngredientInterface) =>
              <li key={ingredient.name as Key}>{ingredient.name} {ingredient.amount.toFixed(2)} {ingredient.unit}</li>
            )}
          </ul>
          <h2>Schritte</h2>
          <ol>
            {recipe.steps.map((value: String) => (
              <li key={value as Key}>{value}</li>
            ))}
          </ol>
        </Grid>
      </Grid>
    </div>
  );
}

export default Recipe;
