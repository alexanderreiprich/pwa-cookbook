import { Button } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { db } from "..";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { TAG } from "../interfaces/TagEnum";

function CreateRecipe() {

  let recipe: RecipeInterface = {
    id: "undefined",
    name: "undefined",
    ingredients: [],
    time: 0,
    image:
      "",
    steps: [],
    description: "undefined",
    difficulty: DIFFICULTY.EASY,
    tags: [],
    favorites: 0,
    author: "undefined",
    date_create: new Date()
  }

  const addRecipe = async (e: any) => {
    // TODO: Read inserted data and convert into RecipeInterface
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "recipes"), recipe);
      alert("Rezept hinzugefügt")
    }
    catch (e) {
      alert("Fehler beim Hinzufügen");
    }
  }
  // TODO: Insert HTML Form for recipe submission
  return(
    <div>
      <Button onClick={addRecipe}>Create Recipe</Button>
    </div>
  );
}