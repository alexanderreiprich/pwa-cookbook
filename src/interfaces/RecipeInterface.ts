import { IngredientInterface } from "./IngredientsInterface"

export interface RecipeInterface {
  name: string,
  ingredients: IngredientInterface[],
  time: number
};