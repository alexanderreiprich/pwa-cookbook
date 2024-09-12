import { RecipeInterface } from "../interfaces/RecipeInterface";
import { 
    checkRecipeLikesInIndexedDB,
    createRecipeInIndexedDB, 
    deleteRecipeInIndexedDB, 
    fetchFromIndexedDB, 
    getRecipeByIdFromIndexedDB,
    syncEmailToFirestore,
    getUsersRecipesInIndexedDB,
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
export async function updateRecipeFavorites(currentUser: User | null, recipe: RecipeInterface, newFavorites: number, likes: boolean, allowFirestorePush: boolean) {
    // mind the order, to prevent a false firestore to idb sync by the service worker!
    // Update in Firestore if online
    if (allowFirestorePush && recipe.public) {
        await updateRecipeFavoritesInFirestore(currentUser, recipe.id, newFavorites, likes);
    }
    // Update in IndexedDB
    await updateRecipeFavoritesInIndexedDB(recipe, newFavorites, likes);
    console.log("updateRecipeFavorites", recipe, newFavorites, likes, allowFirestorePush);
}

// Function to update a recipe
export async function updateRecipe(id: string, updatedRecipe: Partial<RecipeInterface>, allowFirestorePush: boolean) {
    // Update in IndexedDB
    updateRecipeInIndexedDB(id, updatedRecipe);

    // Update in Firestore if online
    if (allowFirestorePush && updatedRecipe.public) {
        await updateRecipeInFirestore(id, updatedRecipe);
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
export async function createRecipe(newRecipe: RecipeInterface, allowFirestorePush: boolean) {
    // Create in IndexedDB
    createRecipeInIndexedDB(newRecipe);
    
    // Create in Firestore if online
    if (allowFirestorePush && newRecipe && newRecipe.public) {
        await createRecipeInFirestore(newRecipe);
    }
}

// Function to delete a recipe
export async function deleteRecipe(id: string, allowFirestorePush: boolean, isPublic: boolean) {
    
    // Delete from Firestore and indexed db if online
    if (allowFirestorePush && isPublic) {
        await deleteRecipeInIndexedDB(id);
        await deleteRecipeInFirestore(id);
    } else if( !isPublic) {
        await deleteRecipeInIndexedDB(id);
    } else {
        alert("Im Offline Modus können leider keine öffentlichen Rezepte gelöscht werden.")
    }
}

export async function checkRecipeLikes(id: string, isPublic: boolean, isOnline: boolean, currentUser: User | null): Promise<LikesInterface> {
    if(isOnline && isPublic) {
        return checkRecipeLikesInFirestore(id, currentUser);    
    } else {
        return checkRecipeLikesInIndexedDB(id);

    }
}

export async function changeRecipeVisibility(id: string, visibility: boolean, allowFirestorePush: boolean) {
    console.log("changeRecipeVisibility", id, visibility, allowFirestorePush);
    if(allowFirestorePush) {
        await changeRecipeVisibilityInFirestore(id, visibility);
    }
    await changeRecipeVisibilityInIndexedDB(id, visibility);
}

export async function getUsersRecipes(currentUser: User | null, isOnline: boolean): Promise<RecipeInterface[]> {
    let recipes = await getUsersRecipesInIndexedDB();
    if(isOnline && (!recipes || recipes.length < 1)) {
        recipes = await getUsersRecipesInFirestore(currentUser);
    }
    return recipes;
}

export async function getUsersFavoriteRecipes(currentUser: User | null, isOnline: boolean): Promise<RecipeInterface[]> {
    if(isOnline) {
        return getUsersFavoriteRecipesInFirestore(currentUser);
    } else return getUsersFavoriteRecipesInIndexedDB();
}

export async function syncEmail(user: User | null){
    if(user && user.email) syncEmailToFirestore(user.email);
}
