import { RecipeInterface } from "../interfaces/RecipeInterface";
import { 
    checkRecipeLikesInIndexedDB,
    createRecipeInIndexedDB, 
    deleteRecipeInIndexedDB, 
    fetchFromIndexedDB, 
    getRecipeByIdFromIndexedDB,
    syncEmailToFirestore,
    getUsersFavoriteRecipesInIndexedDB,
    updateRecipeFavoritesInIndexedDB, 
    updateRecipeInIndexedDB,
    changeRecipeVisibilityInIndexedDB 
} from "./idb";
import { 
    changeRecipeVisibilityInFirestore,
    checkRecipeLikesInFirestore,
    createRecipeInFirestore, 
    deleteRecipeInFirestore, 
    fetchFromFirestore, 
    getAllRecipesFromFirestore, 
    getRecipeByIdFromFirestore,
    getUsersRecipesInFirestore,
    getUsersFavoriteRecipesInFirestore,
    updateRecipeFavoritesInFirestore, 
    updateRecipeInFirestore 
} from "./firestore";
import { User } from "firebase/auth";
import { FilterInterface } from "../interfaces/FilterInterface";
import { LikesInterface } from "../interfaces/LikesInterface";

// Function to update recipe favorites
export async function updateRecipeFavorites(currentUser: User | null, recipe: RecipeInterface, newFavorites: number, likes: boolean, isOnline: boolean) {
    // Update in IndexedDB
    updateRecipeFavoritesInIndexedDB(recipe, newFavorites, likes);

    // Update in Firestore if online
    if (isOnline && recipe.public) {
        await updateRecipeFavoritesInFirestore(currentUser, recipe.id, newFavorites, likes);
    }
}

// Function to update a recipe
export async function updateRecipe(id: string, updatedRecipe: Partial<RecipeInterface>, isOnline: boolean, image?: File) {
    // Update in IndexedDB
    updateRecipeInIndexedDB(id, updatedRecipe, image);

    // Update in Firestore if online
    if (isOnline) {
        await updateRecipeInFirestore(id, updatedRecipe, image);
    }
}

// Function to get all recipes
export async function getAllRecipes(filters: FilterInterface, isOnline: boolean): Promise<RecipeInterface[]> {
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
export async function createRecipe(newRecipe: RecipeInterface, isOnline: boolean, image?: File,) {
    // Create in IndexedDB
    createRecipeInIndexedDB(newRecipe, image);
    
    // Create in Firestore if online
    if (isOnline) {
        await createRecipeInFirestore(newRecipe, image);
    }
}

// Function to delete a recipe
export async function deleteRecipe(id: string, isOnline: boolean, isPublic: boolean, currentUser: User | null) {
    
    // Delete from Firestore and indexed db if online
    if (isOnline && isPublic) {
        await deleteRecipeInIndexedDB(id);
        await deleteRecipeInFirestore(id, currentUser);
    } else if( !isPublic) {
        await deleteRecipeInIndexedDB(id);
    } else {
        alert("Im Offline Modus können leider keine öffentlichen Rezepte gelöscht werden.")
    }
}

export async function checkRecipeLikes(id: string, isOnline: boolean, currentUser: User | null): Promise<LikesInterface> {
    if(isOnline) {
        return checkRecipeLikesInFirestore(id, currentUser);    
    } else {
        return checkRecipeLikesInIndexedDB(id);

    }
}

export async function changeRecipeVisibility(recipe: Partial<RecipeInterface>, visibility: boolean, isOnline: boolean) {
    await changeRecipeVisibilityInIndexedDB(recipe, visibility);
    if(isOnline) {
        await changeRecipeVisibilityInFirestore(recipe, visibility);
    }
}

export function getUsersRecipes(currentUser: User | null, isOnline: boolean): Promise<RecipeInterface[]> {
    if(isOnline) {
        return getUsersRecipesInFirestore(currentUser);
    }
    else {
        return getUsersRecipesInFirestore(currentUser);
    }
}

export async function getUsersFavoriteRecipes(currentUser: User | null, isOnline: boolean): Promise<RecipeInterface[]> {
    if(isOnline) {
        return getUsersFavoriteRecipesInFirestore(currentUser);
    } else return getUsersFavoriteRecipesInIndexedDB();
}

export async function syncEmail(user: User | null){
    if(user && user.email) syncEmailToFirestore(user.email);
}
