import { IngredientInterface } from "./IngredientsInterface"
import { DIFFICULTY } from "./DifficultyEnum"
import { TAG } from "./TagEnum"
export interface RecipeInterface {
  id: string,
  name: string,
  image: string,
  description: string,
  ingredients: IngredientInterface[],
  time: number,
  difficulty: DIFFICULTY,
  tags: TAG[],
  steps: string[]
  favorites: number,
  author: string,
  date_create: Date
};