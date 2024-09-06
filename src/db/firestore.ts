import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "..";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { TAG } from "../interfaces/TagEnum";
import { parseDate } from "../helpers/synchDBHelper";

export async function fetchFromFirestore(q: any): Promise<RecipeInterface[]> {
    try{
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data() as Partial<RecipeInterface>; // Type Assertion
        
            // Konvertiere Firestore-Timestamp zu JavaScript-Date
            const date_create = data.date_create instanceof Timestamp 
            ? data.date_create.toDate()
            : new Date(data.date_create ?? Date.now());
        
            return {
            id: doc.id,
            ...data,
            date_create,
            } as RecipeInterface;
        });
    } catch (error) {
        console.log(error);
        return [];
    }
}


export async function updateRecipeFavoritesInFirestore(id: string, newFavorites: number): Promise<void> {
    try {
      const recipeRef = doc(db, 'recipes', id);
      await updateDoc(recipeRef, { favorites: newFavorites });
      console.log('Favoriten erfolgreich in Firestore aktualisiert.');
    } catch (err) {
        console.log(err);
    }
  }

export async function updateRecipeInFirestore(id: string, updatedRecipe: Partial<RecipeInterface>): Promise<void> {
    try {
      const recipeRef = doc(db, 'recipes', id);
      // updates recipe in firestore
      await setDoc(recipeRef, updatedRecipe, { merge: true });
      console.log('Rezept erfolgreich in Firestore aktualisiert.');
    } catch (e) {
        console.log(e);
    }

}

export async function getAllRecipesFromFirestore(filters: any): Promise<RecipeInterface[]> {
    let recipes: RecipeInterface[] = [];
    try {
      let q: any = collection(db, 'recipes');
  
      if (filters.timeMin) {
        q = query(q, where('time', '>=', Number(filters.timeMin)));
      }
      if (filters.timeMax) {
        q = query(q, where('time', '<=', Number(filters.timeMax)));
      }
      if (filters.tags && filters.tags.length > 0) {
        let chosenTags = filters.tags.map((tag: string) => TAG[tag as keyof typeof TAG]);
        q = query(q, where('tags', 'array-contains-any', chosenTags));
      }
      if (filters.difficulty && filters.difficulty.length > 0) {
        q = query(q, where('difficulty', '==', DIFFICULTY[filters.difficulty as keyof typeof DIFFICULTY]));
      }
  
      recipes = await fetchFromFirestore(q);
    } catch (error) {
      console.error('Fehler beim Abrufen von Firestore:', error);
      return [];
    }
    return recipes;
  }


  export async function getRecipeByIdFromFirestore(id: string): Promise<RecipeInterface | null> {
    try {
      const recipeRef = doc(db, 'recipes', id);
      const docSnap = await getDoc(recipeRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<RecipeInterface>;
  
        return {
          ...data,
          id: docSnap.id,
          date_create: parseDate(data.date_create),
        } as RecipeInterface;
      } else {
        console.log('Rezept nicht in Firestore gefunden. Versuche, es aus IndexedDB abzurufen.');
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen von Firestore-Daten:', error);
      console.log('Versuche, das Rezept aus IndexedDB abzurufen.');
      return null;
    }
  }

export async function createRecipeInFirestore(newRecipe: RecipeInterface): Promise<void> {
    try {
      const recipeRef = doc(db, 'recipes', newRecipe.id);
  
      await setDoc(recipeRef, newRecipe);
      console.log('Rezept erfolgreich in Firestore erstellt.');
  
    } catch (err) {
        console.log(err);
    }
  }

  export async function deleteRecipeInFirestore(id: string): Promise<void> {
    try {
      const recipeRef = doc(db, 'recipes', id);

      await deleteDoc(recipeRef);
      console.log('Rezept erfolgreich aus Firestore gelöscht.');

    } catch (err) {
        console.log(err);
    }
  }