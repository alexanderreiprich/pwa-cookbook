import { Button } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { db } from "..";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { TAG } from "../interfaces/TagEnum";
import EditRecipe from "./EditRecipe";
import { useAuth } from "./Authentication";

export default function CreateRecipe() {
  const { currentUser } = useAuth();
  let recipe: RecipeInterface = {
    id: "",
    name: "",
    ingredients: [],
    number_of_people: 0,
    time: 0,
    image:
      "",
    steps: [],
    description: "",
    difficulty: DIFFICULTY.EASY,
    tags: [],
    favorites: 0,
    author: currentUser ? (currentUser.displayName ? currentUser.displayName : (currentUser.email ? currentUser.email : "unknown")) : "unknown",
    date_create: new Date(),
    date_edit: new Date()
  }

  return(
    <div>
      <EditRecipe recipe={recipe} isNew={true} ></EditRecipe>
    </div>
  );
}