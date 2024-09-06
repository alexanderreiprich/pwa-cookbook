import { openDB, IDBPDatabase } from "idb";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { parseDate } from "../helpers/synchDBHelper";

const dbPromise = openDB('recipes-db', 1, {
    upgrade(db) {
      db.createObjectStore('recipes', { keyPath: 'id' });
    },
  });
  
export async function initDB() {
return dbPromise;
}

export async function saveRecipeToDB(recipe: RecipeInterface) {
    const db = await initDB();
    const tx = db.transaction('recipes', 'readwrite');
    await tx.objectStore('recipes').put(recipe);
    await tx.done;
}

export async function getAllRecipesFromDB(): Promise<RecipeInterface[]> {
    const db = await initDB();
    const tx = db.transaction('recipes', 'readonly');
    const recipes = await tx.objectStore('recipes').getAll();
    await tx.done;
    
    // Datum-Parsing
    return recipes.map(recipe => ({
      ...recipe,
      date_create: parseDate(recipe.date_create)
    }));
  }
  

export async function fetchFromIndexedDB(): Promise<RecipeInterface[]> {
    const db = await dbPromise;
    const recipes = await db.getAll('recipes');

    // Datum-Parsing
    return recipes.map(recipe => ({
        ...recipe,
        date_create: parseDate(recipe.date_create)
    }));
}

export async function getRecipeByIdFromIndexedDB(id: string): Promise<RecipeInterface | null> {
    const db = await dbPromise;
    const recipe = await db.get('recipes', id);

    if (!recipe) return null;

    // Datum-Parsing
    return {
        ...recipe,
        date_create: parseDate(recipe.date_create)
    };
}
  

export async function updateRecipeInIndexedDB( id: string, updatedRecipe: Partial<RecipeInterface>) {
    try{
    const db = await dbPromise;
      await db.put('recipes', { id, ...updatedRecipe });
      console.log('Rezept erfolgreich in IndexedDB aktualisiert.');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Rezepts:', error);
      // Fehlerbehandlung, falls Firestore-Update fehlschlägt
      console.log('Fehler beim Aktualisieren in Firestore. Versuche, IndexedDB zu aktualisieren.');
  
      const db = await dbPromise;
      await db.put('recipes', { id, ...updatedRecipe });
      console.log('Rezept erfolgreich in IndexedDB aktualisiert.');
    }
}

export async function createRecipeInIndexedDB(newRecipe: RecipeInterface): Promise<void> {
    try {
      // Rezept auch in IndexedDB speichern
      const db = await dbPromise;
      await db.put('recipes', newRecipe);
      console.log('Rezept erfolgreich in IndexedDB gespeichert.');
    } catch (error) {
      console.error('Fehler beim Erstellen des Rezepts:', error);
      // Fehlerbehandlung, falls Firestore-Create fehlschlägt
      console.log('Fehler beim Erstellen in Firestore. Versuche, IndexedDB zu verwenden.');
  
      const db = await dbPromise;
      await db.put('recipes', newRecipe);
      console.log('Rezept erfolgreich in IndexedDB gespeichert.');
    }
  }

  export async function deleteRecipeInIndexedDB(id: string): Promise<void> {
    try {
      // Rezept auch aus IndexedDB löschen
      const db = await dbPromise;
      await db.delete('recipes', id);
      console.log('Rezept erfolgreich aus IndexedDB gelöscht.');
    } catch (error) {
      console.error('Fehler beim Löschen des Rezepts:', error);
      // Fehlerbehandlung, falls Firestore-Delete fehlschlägt
      console.log('Fehler beim Löschen in Firestore. Versuche, IndexedDB zu verwenden.');
  
      // Versuche, das Rezept nur aus IndexedDB zu löschen, falls Firestore-Delete fehlschlägt
      const db = await dbPromise;
      await db.delete('recipes', id);
      console.log('Rezept erfolgreich aus IndexedDB gelöscht.');
    }
  }

export async function updateRecipeFavoritesInIndexedDB(id: string, newFavorites: number): Promise<void> {
    try {
    const db = await dbPromise;
    const recipe = await db.get('recipes', id);
    if (recipe) {
        recipe.favorites = newFavorites;
        await db.put('recipes', recipe);
        console.log('Favoriten erfolgreich in IndexedDB aktualisiert.');
    }
    } catch (error) {
    console.error('Fehler beim Aktualisieren der Favoriten:', error);
    // Fehlerbehandlung, falls Firestore-Update fehlschlägt
    console.log('Fehler beim Aktualisieren in Firestore. Versuche, IndexedDB zu verwenden.');

    // Versuche, das Rezept nur in IndexedDB zu aktualisieren, falls Firestore-Update fehlschlägt
    const db = await dbPromise;
    const recipe = await db.get('recipes', id);
    if (recipe) {
        recipe.favorites = newFavorites;
        await db.put('recipes', recipe);
        console.log('Favoriten erfolgreich in IndexedDB aktualisiert.');
    }
    }
}
  