import { doc, Timestamp, writeBatch } from "firebase/firestore";
import { getAllRecipesFromDB } from "../db/idb";
import { db } from "..";
import { RecipeInterface } from "../interfaces/RecipeInterface";
export async function syncFirestoreWithIndexedDB() {
  const recipes = await getAllRecipesFromDB();
  
  const batch = writeBatch(db);
  
  recipes.forEach((recipe) => {
    const recipeRef = doc(db, 'recipes', recipe.id);
    batch.set(recipeRef, recipe);
  });
  
  await batch.commit();
}

export function convertToDate(date: any): Date {
  if (date instanceof Date) {
    return date;
  } else if (date.toDate) {
    return date.toDate();
  } else {
    return new Date(date);
  }
}

export function convertToTimestamp(date: Date | Timestamp | undefined): Timestamp {
  if(!date) return Timestamp.fromDate(new Date());
  if(date instanceof Timestamp ) return date;
  if(date instanceof Date) return Timestamp.fromDate(date);
  if(date as {seconds: number, nanoseconds: number}){
    return date as Timestamp;
  }
  return Timestamp.fromDate(new Date());
}

export function saveRecipe(recipe: Partial<RecipeInterface>): Object {
  let dateCreate = convertToTimestamp(recipe.date_create);
  let dateEdit = convertToTimestamp(recipe.date_edit);
  console.log("saveRecipe", dateCreate, dateEdit);
  return {...recipe, date_create: dateCreate, date_edit: dateEdit}
}
