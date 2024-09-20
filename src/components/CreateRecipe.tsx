import { RecipeInterface } from "../interfaces/RecipeInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import EditRecipe from "./EditRecipe";
import { useAuth } from "../provider/Authentication";
import { Timestamp } from "firebase/firestore";
import { USER_UNKNOWN } from "../App";

export default function CreateRecipe() {
  const { currentUser } = useAuth();
  let recipe: RecipeInterface = {
    id: "",
    name: "",
    ingredients: [],
    number_of_people: 0,
    time: 0,
    image: "",
    steps: [],
    description: "",
    difficulty: DIFFICULTY.Einfach,
    tags: [],
    favorites: 0,
    author: currentUser ? (currentUser.displayName ? currentUser.displayName : (currentUser.email ? currentUser.email : USER_UNKNOWN)) : USER_UNKNOWN,
    date_create: Timestamp.now(),
    date_edit: Timestamp.now(),
    public: false
  }

  return(
    <div>
      <EditRecipe recipe={recipe} isNew={true} ></EditRecipe>
    </div>
  );
}