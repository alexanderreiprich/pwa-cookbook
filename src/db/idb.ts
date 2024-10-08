import { openDB } from "idb";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { saveRecipe } from "../helper/helperFunctions";
import { Timestamp } from "firebase/firestore";
import { LikesInterface } from "../interfaces/LikesInterface";
import { USER_UNKNOWN } from "../App";

const dbPromise = openDB('recipes-db', 3, {
  upgrade(db, oldVersion, newVersion) {
    console.log(`Upgrading from version ${oldVersion} to ${newVersion}`);
    if (oldVersion < 1) {
      db.createObjectStore('recipes', { keyPath: 'id' });
    }
    if (oldVersion < 2) {
      db.createObjectStore('user', { keyPath: 'id' });
    }
    if (oldVersion < 3) {
      db.createObjectStore('images', { keyPath: 'id' });
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
  return recipes
}


export async function fetchFromIndexedDB(): Promise<RecipeInterface[]> {
  const db = await initDB();
  const recipes = await db.getAll('recipes');
  return recipes;
}

export async function getRecipeByIdFromIndexedDB(id: string): Promise<RecipeInterface | null> {
  const db = await initDB();
  const recipe = await db.get('recipes', id);
  return recipe;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  })
}

export async function saveImageAsBase64(id: string, imageBlob: Blob): Promise<void> {
  const db = await dbPromise;
  const base64Image: string = await blobToBase64(imageBlob);
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');
  await store.put({ id, image: base64Image, date_edit: Timestamp.now() });
  await tx.done;
}

export async function getImageBase64(id: string): Promise<string | null> {
  const db = await dbPromise;
  const tx = db.transaction('images', 'readonly');
  const store = tx.objectStore('images');
  const imageRecord: { id: string; image: string, date_edit: Timestamp } | undefined = await store.get(id);
  await tx.done;

  if (imageRecord) {
    return imageRecord.image;
  } else {
    console.error(`Image with id ${id} not found.`);
    return null;
  }
}

export async function updateRecipeInIndexedDB(id: string, updatedRecipe: Partial<RecipeInterface>, image?: File) {
  try {
    const db = await initDB();
    if (image) {
      await saveImageAsBase64(id, image);
      const url = await getImageBase64(id);
      updatedRecipe.image = url!;
    }
    await db.put('recipes', { id, ...saveRecipe(updatedRecipe) });
    console.log('Rezept erfolgreich in IndexedDB aktualisiert.');
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Rezepts in der Indexed DB:', error);
  }
}

export async function createRecipeInIndexedDB(newRecipe: RecipeInterface, image?: File): Promise<void> {
  try {
    const db = await initDB();
    if (image) {
      await saveImageAsBase64(newRecipe.id, image);
      const url = await getImageBase64(newRecipe.id);
      newRecipe.image = url!;
    }
    await db.put('recipes', saveRecipe(newRecipe));
    console.log('Rezept erfolgreich in IndexedDB gespeichert.');
  } catch (error) {
    console.error('Fehler beim Erstellen des Rezepts in der Indexed DB:', error);
  }
}

export async function deleteRecipeInIndexedDB(id: string): Promise<void> {
  try {
    const db = await initDB();
    const isLiked = await checkRecipeLikesInIndexedDB(id);
    if (isLiked) {
      updateFavoritesListInIndexedDB(id, false);
    }
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
    const tx = db.transaction(['recipes'], 'readwrite');
    const recipesStore = tx.objectStore('recipes');

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
    updateFavoritesListInIndexedDB(id, likes);

    // Commit the transaction
    await tx.done;
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Favoriten:', error);
  }
}

async function updateFavoritesListInIndexedDB(id: string, likes: boolean) {
  const db = await initDB();
  const tx = db.transaction(['user'], 'readwrite');
  const userStore = tx.objectStore('user');
  let userFavorites: string[] = await userStore.get('userFavorites') || []; // Retrieve existing favorites or initialize
  let userFavoritesList: string[] = []; // Fallback in case the list is empty
  let userFavoritesEditDate = Timestamp.now();

  // Convert userFavorites to an array if it's an object
  if (userFavorites && typeof userFavorites === 'object' && !Array.isArray(userFavorites)) {
    if (userFavorites["favorites"]) {
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
  const favoritesEntry = { id: "userFavorites", favorites: userFavoritesList, date_edit: userFavoritesEditDate }; // Use a fixed key and include the updated favorites list
  await userStore.put(favoritesEntry);
  console.log('Benutzerdaten erfolgreich in IndexedDB aktualisiert.');

}

export async function checkRecipeLikesInIndexedDB(id: string): Promise<LikesInterface> {
  const db = await initDB();
  const tx = db.transaction(['user'], 'readwrite');
  const userStore = tx.objectStore('user');

  // Get user favorites
  let userFavorites: string[] = await userStore.get('userFavorites') || []; // Retrieve existing favorites or initialize
  let userFavoritesList: string[] = [];
  // Convert userFavorites to an array if it's an object
  if (userFavorites && typeof userFavorites === 'object' && !Array.isArray(userFavorites)) {
    if (userFavorites["favorites"]) {
      // this is the standard case
      userFavoritesList = userFavorites["favorites"];
    }
  } else if (!Array.isArray(userFavorites)) {
    userFavoritesList = [];
  }
  const recipe = await getRecipeByIdFromIndexedDB(id);
  const numberOfLikes = recipe && recipe.favorites ? recipe.favorites : 0;
  const isPublic = recipe && recipe.public ? recipe.public : false;
  return { likes: userFavoritesList.includes(id), numberOfLikes: numberOfLikes, isPublic: isPublic } as LikesInterface;
}

// only used by authentication.tsx, after user is logged in
export async function syncUserToFirestore(email: string, username: string) {
  const db = await initDB();
  const tx = db.transaction(['user'], 'readwrite');
  const userStore = tx.objectStore('user');

  let storedEmail: string = await userStore.get('email') || "";
  if (email && storedEmail !== email) {
    const emailEntry = { id: "email", email: email, displayName: username };
    await userStore.put(emailEntry);
  }
}

export async function changeRecipeVisibilityInIndexedDB(id: string, visibility: boolean) {
  if (id) {
    const favoritesList = await getUsersFavoritesList();
    const newNumberOfFavorites = id && favoritesList.includes(id) ? 1 : 0;
    const recipe = await getRecipeByIdFromIndexedDB(id);
    const recipeDoc: Partial<RecipeInterface> = { ...recipe, favorites: newNumberOfFavorites, public: visibility, date_edit: Timestamp.now() }
    updateRecipeInIndexedDB(id, recipeDoc);
  }
}

export async function getUsersRecipesInIndexedDB() {
  const db = await initDB();
  const tx = db.transaction(['user'], 'readwrite');
  const userStore = tx.objectStore('user');

  // Get user favorites
  let storedEmail = await userStore.get('email') || { email: USER_UNKNOWN };
  let recipes: RecipeInterface[] = []
  recipes = await fetchFromIndexedDB();
  return recipes.filter(recipe => recipe.author == storedEmail.email || recipe.author == USER_UNKNOWN);
}

export async function getUsersFavoritesList(): Promise<string[]> {
  const db = await initDB();
  const tx = db.transaction(['user'], 'readwrite');
  const userStore = tx.objectStore('user');
  let userFavorites: string[] = await userStore.get('userFavorites') || []; // Retrieve existing favorites or initialize
  let userFavoritesList: string[] = [];
  // Convert userFavorites to an array if it's an object
  if (userFavorites && typeof userFavorites === 'object' && !Array.isArray(userFavorites)) {
    if (userFavorites["favorites"]) {
      // this is the standard case
      userFavoritesList = userFavorites["favorites"];
    }
  } else if (!Array.isArray(userFavorites)) {
    userFavoritesList = [];
  }
  return userFavoritesList;
}

export async function getUsersFavoriteRecipesInIndexedDB(): Promise<RecipeInterface[]> {
  let favoritesList = await getUsersFavoritesList();
  let recipes: RecipeInterface[] = []
  recipes = await fetchFromIndexedDB();
  return recipes.filter(recipe => favoritesList.includes(recipe.id));
}

export async function logoutInIndexedDB() {
  const db = await initDB();
  const tx = db.transaction(['user'], 'readwrite');
  const userStore = tx.objectStore('user');
  await userStore.delete('email');
}