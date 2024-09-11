import { openDB } from "idb";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { saveRecipe } from "../helpers/synchDBHelper";
import { Timestamp } from "firebase/firestore";

const dbPromise = openDB('recipes-db', 2, {
  upgrade(db, oldVersion, newVersion) {
    console.log(`Upgrading from version ${oldVersion} to ${newVersion}`);
    if (oldVersion < 1) {
      db.createObjectStore('recipes', { keyPath: 'id' });
    }
    if (oldVersion < 2) {
      db.createObjectStore('user', { keyPath: 'id' });
      db.createObjectStore('tags', { keyPath: 'id' });
    }
  },
});

dbPromise.then(() => {
  console.log('IndexedDB initialized');
}).catch((error) => {
  console.error('Error initializing IndexedDB:', error);
});

export async function initDB() {
return dbPromise;
}

export async function getAllRecipesFromDB(): Promise<RecipeInterface[]> {
    const db = await initDB();
    const tx = db.transaction('recipes', 'readonly');
    const recipes = await tx.objectStore('recipes').getAll();
    await tx.done;
    
    // Date-Parsing
    return recipes.map(recipe => ({
      ...recipe
    }));
  }
  

export async function fetchFromIndexedDB(): Promise<RecipeInterface[]> {
    const db = await initDB();
    const recipes = await db.getAll('recipes');

    // Date-Parsing
    return recipes.map(recipe => ({
        ...recipe
    }));
}

export async function getRecipeByIdFromIndexedDB(id: string): Promise<RecipeInterface | null> {
    const db = await initDB();
    const recipe = await db.get('recipes', id);

    if (!recipe) return null;

    // Date-Parsing
    return {
        ...recipe
    };
}
  

export async function updateRecipeInIndexedDB( id: string, updatedRecipe: Partial<RecipeInterface>) {
    try{
    const db = await initDB();
      await db.put('recipes', { id, ...saveRecipe(updatedRecipe) });
      console.log('Rezept erfolgreich in IndexedDB aktualisiert.');
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Rezepts in der Indexed DB:', error);
    }
}

export async function createRecipeInIndexedDB(newRecipe: RecipeInterface): Promise<void> {
  try {
    const db = await initDB();
    await db.put('recipes', saveRecipe(newRecipe));
    console.log('Rezept erfolgreich in IndexedDB gespeichert.');
  } catch (error) {
    console.error('Fehler beim Erstellen des Rezepts in der Indexed DB:', error);
  }
}

export async function deleteRecipeInIndexedDB(id: string): Promise<void> {
  try {
    const db = await initDB();
    await db.delete('recipes', id);
    console.log('Rezept erfolgreich aus IndexedDB gelöscht.');
  } catch (error) {
    console.error('Fehler beim Löschen des Rezepts in der Indexed DB:', error);
  }
}

export async function updateRecipeFavoritesInIndexedDB(recipeDoc: RecipeInterface, newFavorites: number, likes: boolean): Promise<void> {
  try {
    const id = recipeDoc.id;
    // Open a transaction with readwrite access
    const db = await initDB();
    const tx = db.transaction(['recipes', 'user'], 'readwrite');
    const recipesStore = tx.objectStore('recipes');
    const userStore = tx.objectStore('user');

    // Update recipe favorites
    const recipe = await recipesStore.get(id);
    if (recipe) {
      recipe.favorites = newFavorites;
      recipe.date_edit = Timestamp.now();
      await recipesStore.put(recipe); // No key provided; relies on keyPath defined in the store
      console.log('Favoriten erfolgreich in IndexedDB aktualisiert.');
    } else if (recipeDoc) {
      updateRecipeInIndexedDB(id, recipeDoc);
    }
    else {
      console.error('Rezept nicht gefunden:');
    }

    // Update user favorites
    let userFavorites: string[] = await userStore.get('userFavorites') || []; // Retrieve existing favorites or initialize
    let userFavoritesList: string[] = []; // Fallback in case the list is empty
    let userFavoritesEditDate = Timestamp.now();
  
   // Convert userFavorites to an array if it's an object
    if (userFavorites && typeof userFavorites === 'object' && !Array.isArray(userFavorites)) {
      if(userFavorites["favorites"]){
        // this is the standard case
        userFavoritesList = userFavorites["favorites"];
      }
    } else if (!Array.isArray(userFavorites)) {
      userFavorites = [];
    }

    if (likes) {
      // Add the recipe ID to the user's favorites if it doesn't already exist
      if (!userFavoritesList.includes(id)) {
        userFavoritesList.push(id);
      }
    } else {
      // Remove the recipe ID from the user's favorites if it exists
      userFavoritesList = userFavoritesList.filter(favoriteId => favoriteId !== id);
    }

    // Store the updated list of favorites
    const favoritesEntry = { id: "userFavorites", favorites: userFavoritesList, edit_date: userFavoritesEditDate }; // Use a fixed key and include the updated favorites list
    await userStore.put(favoritesEntry);
    console.log('Benutzerdaten erfolgreich in IndexedDB aktualisiert.');

    // Commit the transaction
    await tx.done;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Favoriten:', error);
  }
}

export async function checkRecipeLikesInIndexedDB (id: string): Promise<boolean> {
  const db = await initDB();
    const tx = db.transaction(['user'], 'readwrite');
    const userStore = tx.objectStore('user');

    // Get user favorites
    let userFavorites: string[] = await userStore.get('userFavorites') || []; // Retrieve existing favorites or initialize
    let userFavoritesList: string[] = [];
   // Convert userFavorites to an array if it's an object
    if (userFavorites && typeof userFavorites === 'object' && !Array.isArray(userFavorites)) {
      if(userFavorites["favorites"]){
        // this is the standard case
        userFavoritesList = userFavorites["favorites"];
      }
    } else if (!Array.isArray(userFavorites)) {
      userFavoritesList = [];
    }

    return userFavoritesList.includes(id);
}

export async function syncEmailToFirestore (email: string) {
  const db = await initDB();
  const tx = db.transaction(['user'], 'readwrite');
  const userStore = tx.objectStore('user');

  // Get user favorites
  let storedEmail:string = await userStore.get('email') || "";
 if(email && storedEmail != email){
  const emailEntry = { id: "email", email: email };
    await userStore.put(emailEntry);
 }
}