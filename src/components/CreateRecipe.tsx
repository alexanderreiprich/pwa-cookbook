import { RecipeInterface } from "../interfaces/RecipeInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import EditRecipe from "./EditRecipe";
import { useAuth } from "./Authentication";
import { convertToTimestamp } from "../helpers/synchDBHelper";
import { Timestamp } from "firebase/firestore";

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
    date_create: Timestamp.now(),
    date_edit: Timestamp.now()
  }

  return(
    <div>
      <EditRecipe recipe={recipe} isNew={true} ></EditRecipe>
    </div>
  );
}