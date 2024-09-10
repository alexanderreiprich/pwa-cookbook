// useRecipes.ts
import { useAuth } from '../components/Authentication';
import { RecipeInterface } from '../interfaces/RecipeInterface';
import { useNetworkStatus } from '../helpers/NetworkStatusProvider'; // Adjust path as needed
import { 
    updateRecipeFavorites, 
    updateRecipe, 
    getAllRecipes, 
    getRecipeById, 
    createRecipe, 
    deleteRecipe,
    checkRecipeLikes,
    changeRecipeVisibility
} from "../helpers/dbHelper";

export function useRecipeActions() {
    const { isOnline } = useNetworkStatus(); // Retrieve the current network status
    const { currentUser } = useAuth();

    const handleUpdateRecipeFavorites = async (id: string, newFavorites: number, likes: boolean) => {
        await updateRecipeFavorites(currentUser, id, newFavorites, likes, isOnline);
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

    const handleCheckRecipeLikes = async (id: string) => {
        return await checkRecipeLikes(id, isOnline, currentUser);
    }

    const handleChangeRecipeVisibility = async (id: string) => {
        return await changeRecipeVisibility(id);
    }

    return {
        handleUpdateRecipeFavorites,
        handleUpdateRecipe,
        handleGetAllRecipes,
        handleGetRecipeById,
        handleCreateRecipe,
        handleDeleteRecipe,
        handleCheckRecipeLikes,
        handleChangeRecipeVisibility
    };
}
