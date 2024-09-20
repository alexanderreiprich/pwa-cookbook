import {
  Box,
  Button,
  FormGroup,
  Grid,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import { Key, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import { TAG } from "../interfaces/TagEnum";
import "../style/Images.css";
import FavoritesButton from "../components/FavoritesButton";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { formatDate } from "../helper/helperFunctions";
import { useDbActionHandler } from "../db/dbActionHandler";
import { useNetworkStatus } from "../provider/NetworkStatusProvider";
import EditRecipe from "../components/EditRecipe";
import RecipeCookMode from "../components/RecipeCookMode";
import { useAuth } from "../provider/Authentication";
import { USER_UNKNOWN } from "../App";
import { BasePage } from "./BasePage";
import ShareButton from "../components/ShareButton";

function Recipe() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<RecipeInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean>(false);
  const [showVisibilityToggle, setShowVisibilityToggle] =
    useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const { handleGetRecipeById, handleChangeRecipeVisibility } =
    useDbActionHandler();
  const { isOnline } = useNetworkStatus();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleVisibilityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (recipe) {
      handleChangeRecipeVisibility(recipe.id, !checked);
      setChecked(!checked);
      setIsPublic(!isPublic);
    }
  };

  const [servings, setServings] = useState<number>(4);

  const handleServingsChange = (event: any) => {
    const newServings = Number(event.target.value);
    setServings(newServings);
  };

  const handleReturnToBrowseRecipes = () => {
    navigate("/", { replace: true });
    window.location.reload();
  };
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        if (id) {
          const recipe = await handleGetRecipeById(id);
          setRecipe(recipe);

          setChecked(recipe!.public);
          setServings(recipe!.number_of_people);
          setIsPublic(recipe!.public);
          setCanEdit(
            (Boolean(recipe?.author) && recipe?.author == currentUser?.email) ||
              recipe?.author === USER_UNKNOWN
          );
          setShowVisibilityToggle(
            isOnline &&
              Boolean(recipe?.author) &&
              recipe?.author == currentUser?.email
          );
        } else {
          setError("Fehler beim Abrufen der Id des Rezepts.");
        }
      } catch (err) {
        return (
          <div>
            <NavigationBar title="Rezepte" />
            <p>
              Fehler beim Laden des Rezeptes... es wurde vermutlich gelöscht
              oder depubliziert
            </p>
            <Button onClick={handleReturnToBrowseRecipes} variant="contained">
              {" "}
              Zurück zur Übersicht?
            </Button>
          </div>
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, currentUser]);

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
        <p>
          Rezept konnte leider nicht geladen werden... es wurde vermutlich
          gelöscht oder depubliziert
        </p>
        <Button onClick={handleReturnToBrowseRecipes} variant="contained">
          {" "}
          Zurück zur Übersicht?
        </Button>
      </div>
    );
  }

  const adjustedIngredients = recipe.ingredients.map((ingredient) => {
    return {
      ...ingredient,
      amount: (ingredient.amount / recipe.number_of_people) * servings,
    };
  });

  return (
    <BasePage title="Rezepte">
      <Grid
        container
        spacing={10}
        justifyContent="center"
        paddingTop={3}
        paddingBottom={3}
      >
        <Grid
          item
          id="recipeHead"
          xs={10}
          md={5}
          style={{ paddingTop: "40px" }}
        >
          <h1>{recipe.name}</h1>
          <div>
            <div>
              <i>von: {recipe.author}</i>
            </div>
            <div>erstellt am: {formatDate(recipe.date_create)}</div>
          </div>
          {showVisibilityToggle ? (
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
                  <b>Lokal</b>
                  <Switch onChange={handleVisibilityChange} checked={checked} />
                  <b>Öffentlich</b>
                </Stack>
              </FormGroup>
            </div>
          ) : null}
          {canEdit ? (
            <EditRecipe recipe={recipe} isNew={false}></EditRecipe>
          ) : null}
          <div>
            <Button
              style={{
                paddingLeft: 0,
                marginLeft: 0,
                minWidth: 0,
                color: "#9c27b0",
                fontWeight: "bold",
              }}
            >
              {DIFFICULTY[recipe.difficulty]}
            </Button>
            {recipe.tags.map((tag: TAG) => (
              <Button key={TAG[tag]}> {TAG[tag]}</Button>
            ))}
            <FavoritesButton recipe={recipe} favorites={recipe.favorites} />
            <ShareButton recipe={recipe} />
            <RecipeCookMode
              recipe={recipe}
              numberOfServings={servings}
            ></RecipeCookMode>
          </div>
          <p> Dauer: {recipe.time} min</p>
          <p>{recipe.description}</p>
        </Grid>
        <Grid item id="recipeImage" xs={10} md={5}>
          <div id="recipeImgContainer">
            <img
              className="image"
              src={recipe.image ? recipe.image : "../public/default.jpg"}
              alt={recipe.name}
            />
          </div>
        </Grid>
        <Grid item id="recipeContent" xs={10} style={{ paddingTop: "10px" }}>
          <h2>Zutaten</h2>
          <p>Anzahl der Personen:</p>
          <Box sx={{ padding: 3 }}>
            <TextField
              type="number"
              size="small"
              value={servings}
              onChange={handleServingsChange}
              inputProps={{ min: 1 }}
              sx={{ width: "100px" }}
            />
          </Box>
          <ul>
            {adjustedIngredients.map((ingredient: IngredientInterface) => (
              <li key={ingredient.name as Key}>
                {ingredient.name}{" "}
                {ingredient.amount == 0
                  ? ""
                  : Number.isInteger(ingredient.amount)
                  ? ingredient.amount.toFixed()
                  : ingredient.amount.toFixed(
                      (Math.round(ingredient.amount * 1e12) / 1e12)
                        .toString()
                        .split(".")[1]?.length || 0
                    )}{" "}
                {ingredient.unit}
              </li>
            ))}
          </ul>
          <h2>Schritte</h2>
          <ol>
            {recipe.steps.map((value: String) => (
              <li style={{ marginBottom: "10px" }} key={value as Key}>
                {value}
              </li>
            ))}
          </ol>
        </Grid>
      </Grid>
      <RecipeCookMode
        recipe={recipe}
        numberOfServings={servings}
      ></RecipeCookMode>
    </BasePage>
  );
}

export default Recipe;
