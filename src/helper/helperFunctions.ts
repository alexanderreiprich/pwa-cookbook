import { doc, Timestamp, writeBatch } from "firebase/firestore";
import { getAllRecipesFromDB } from "../db/idb";
import { db } from "..";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { getRecipeByIdFromFirestore } from "../db/firestore";


export async function syncFirestoreWithIndexedDB() {
  const recipes = await getAllRecipesFromDB();
  
  const batch = writeBatch(db);
  
  recipes.forEach((recipe) => {
    const recipeRef = doc(db, 'recipes', recipe.id);
    batch.set(recipeRef, recipe);
  });
  
  await batch.commit();
}

export async function checkRecipeVersioning(id: string, oldDateEdit: Timestamp): Promise<boolean> {
  console.log(id);
  if(!id) return true;
    const firestoreDoc = await getRecipeByIdFromFirestore(id);
    if (firestoreDoc && oldDateEdit) {
        if (oldDateEdit >= firestoreDoc.date_edit) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
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
  return {...recipe, date_create: dateCreate, date_edit: dateEdit}
}

export function formatDate (date: Date | Timestamp | undefined): string {
  if(!date) return "?";
  if( date instanceof Date) {
      return date.toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
      });
  } else if (date instanceof Timestamp) {
      return date.toDate().toDateString();
      }
  else  if (date as {seconds: number, nanoseconds: number}) {
      let convertedDate: {seconds: number, nanoseconds: number} = date;
      let result = (new Date(convertedDate.seconds * 1000 + convertedDate.nanoseconds / 1000000)).toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
      });
      if(!result) {
          result = date as string;
      }
      return result;
   } else return "?";
};
