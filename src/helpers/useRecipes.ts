// useRecipes.ts
import { RecipeInterface } from '../interfaces/RecipeInterface';
import { useNetworkStatus } from './NetworkStatusProvider'; // Adjust path as needed
import { 
    updateRecipeFavorites, 
    updateRecipe, 
    getAllRecipes, 
    getRecipeById, 
    createRecipe, 
    deleteRecipe 
} from "./dbHelper";

export function useRecipeActions() {
    const { isOnline } = useNetworkStatus(); // Retrieve the current network status

    const handleUpdateRecipeFavorites = async (id: string, newFavorites: number) => {
        await updateRecipeFavorites(id, newFavorites, isOnline);
    };

    const handleUpdateRecipe = async (id: string, updatedRecipe: Partial<RecipeInterface>) => {
        await updateRecipe(id, updatedRecipe, isOnline);
    };

    const handleGetAllRecipes = async (filters: any) => {
        return await getAllRecipes(filters, isOnline);
    };

    const handleGetRecipeById = async (id: string) => {
        return await getRecipeById(id, isOnline);
    };

    const handleCreateRecipe = async (newRecipe: RecipeInterface) => {
        await createRecipe(newRecipe, isOnline);
    };

    const handleDeleteRecipe = async (id: string) => {
        await deleteRecipe(id, isOnline);
    };

    return {
        handleUpdateRecipeFavorites,
        handleUpdateRecipe,
        handleGetAllRecipes,
        handleGetRecipeById,
        handleCreateRecipe,
        handleDeleteRecipe,
    };
}
