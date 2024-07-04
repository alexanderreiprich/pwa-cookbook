import { IngredientInterface } from "./IngredientsInterface"

export interface RecipeInterface {
  id: string,
  name: string,
  ingredients: IngredientInterface[],
  time: number,
  image: string,
  steps: string[]
};