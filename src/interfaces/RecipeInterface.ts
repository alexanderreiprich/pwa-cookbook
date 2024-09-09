import { IngredientInterface } from "./IngredientsInterface"
import { DIFFICULTY } from "./DifficultyEnum"
import { TAG } from "./TagEnum"
import { Timestamp } from "firebase/firestore"
export interface RecipeInterface {
  id: string,
  name: string,
  image: string,
  description: string,
  ingredients: IngredientInterface[],
  number_of_people: number,
  time: number,
  difficulty: DIFFICULTY,
  tags: TAG[],
  steps: string[]
  favorites: number,
  author: string,
  date_create: Timestamp,
  date_edit: Timestamp
};