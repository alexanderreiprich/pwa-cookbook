import { Button } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { db } from "..";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { TAG } from "../interfaces/TagEnum";
import EditRecipe from "./EditRecipe";

export default function CreateRecipe() {

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
    author: "test",
    date_create: new Date()
  }

  return(
    <div>
      <EditRecipe recipe={recipe} isNew={true}></EditRecipe>
    </div>
  );
}