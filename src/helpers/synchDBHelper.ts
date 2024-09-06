import { doc, writeBatch } from "firebase/firestore";
import { getAllRecipesFromDB } from "../db/idb";
import { db } from "..";
export async function syncFirestoreWithIndexedDB() {
  const recipes = await getAllRecipesFromDB();
  
  const batch = writeBatch(db);
  
  recipes.forEach((recipe) => {
    const recipeRef = doc(db, 'recipes', recipe.id);
    batch.set(recipeRef, recipe);
  });
  
  await batch.commit();
}

export function parseDate(date: any): Date {
  if (date instanceof Date) {
    return date;
  } else if (date.toDate) {
    return date.toDate();
  } else {
    return new Date(date);
  }
}