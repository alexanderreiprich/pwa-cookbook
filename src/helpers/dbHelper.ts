import { RecipeInterface } from "../interfaces/RecipeInterface";
import { 
    checkRecipeLikesInIndexedDB,
    createRecipeInIndexedDB, 
    deleteRecipeInIndexedDB, 
    fetchFromIndexedDB, 
    getRecipeByIdFromIndexedDB,
    updateRecipeFavoritesInIndexedDB, 
    updateRecipeInIndexedDB 
} from "../db/idb";
import { 
    changeRecipeVisibilityInFirestore,
    checkRecipeLikesInFirestore,
    createRecipeInFirestore, 
    deleteRecipeInFirestore, 
    fetchFromFirestore, 
    getAllRecipesFromFirestore, 
    getRecipeByIdFromFirestore,
    updateRecipeFavoritesInFirestore, 
    updateRecipeInFirestore 
} from "../db/firestore";
import { User } from "firebase/auth";
import { OfflineUser } from "../components/Authentication";

// Function to update recipe favorites
export async function updateRecipeFavorites(currentUser: User | OfflineUser | null, id: string, newFavorites: number, likes: boolean, isOnline: boolean) {
    // Update in IndexedDB
    updateRecipeFavoritesInIndexedDB(id, newFavorites, likes);

    // Update in Firestore if online
    if (isOnline) {
        await updateRecipeFavoritesInFirestore(currentUser, id, newFavorites, likes);
    }
}

// Function to update a recipe
export async function updateRecipe(id: string, updatedRecipe: Partial<RecipeInterface>, isOnline: boolean) {
    // Update in IndexedDB
    updateRecipeInIndexedDB(id, updatedRecipe);

    // Update in Firestore if online
    if (isOnline) {
        await updateRecipeInFirestore(id, updatedRecipe);
    }
}

// Function to get all recipes
export async function getAllRecipes(filters: any, isOnline: boolean): Promise<RecipeInterface[]> {
    let recipes: RecipeInterface[] = [];
    
    // Fetch from Firestore if online
    if (isOnline) {
        recipes = await getAllRecipesFromFirestore(filters);
        // Fallback to IndexedDB if no recipes found in Firestore
        if (!recipes || recipes.length === 0) {
            recipes = await fetchFromFirestore(filters);
        }
    } else {
        // Fetch from IndexedDB if offline
        recipes = await fetchFromIndexedDB();
    }
    
    return recipes;
}

// Function to get a recipe by ID
export async function getRecipeById(id: string, isOnline: boolean): Promise<RecipeInterface | null> {
    let recipe: RecipeInterface | null = null;

    // Fetch from Firestore if online
    if (isOnline) {
        recipe = await getRecipeByIdFromFirestore(id);
        // Fallback to IndexedDB if recipe not found in Firestore
        if (!recipe) {
            recipe = await getRecipeByIdFromIndexedDB(id);
        }
    } else {
        // Fetch from IndexedDB if offline
        recipe = await getRecipeByIdFromIndexedDB(id);
    }

    return recipe;
}

// Function to create a new recipe
export async function createRecipe(newRecipe: RecipeInterface, isOnline: boolean) {
    // Create in IndexedDB
    createRecipeInIndexedDB(newRecipe);
    
    // Create in Firestore if online
    if (isOnline) {
        await createRecipeInFirestore(newRecipe);
    }
}

// Function to delete a recipe
export async function deleteRecipe(id: string, isOnline: boolean) {
    // Delete from IndexedDB
    await deleteRecipeInIndexedDB(id);
    
    // Delete from Firestore if online
    if (isOnline) {
        await deleteRecipeInFirestore(id);
    }
}

export async function checkRecipeLikes(id: string, isOnline: boolean, currentUser: User | OfflineUser | null): Promise<boolean> {
    if(isOnline) {
        return checkRecipeLikesInFirestore(id, currentUser);    
    } else {
        return checkRecipeLikesInIndexedDB(id);

    }
}

export async function changeRecipeVisibility(id: string) {
    return changeRecipeVisibilityInFirestore(id);
}
