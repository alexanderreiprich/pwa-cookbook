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
    changeRecipeVisibility,
    getUsersRecipes,
    getUsersSavedRecipes
} from "../helpers/dbActions";
import { FilterInterface } from '../interfaces/FilterInterface';

export function useDbActionHandler() {
    const { isOnline } = useNetworkStatus(); // Retrieve the current network status
    const { currentUser } = useAuth();

    const handleUpdateRecipeFavorites = async (recipe: RecipeInterface, newFavorites: number, likes: boolean) => {
        await updateRecipeFavorites(currentUser, recipe, newFavorites, likes, isOnline);
    };

    const handleUpdateRecipe = async (id: string, updatedRecipe: Partial<RecipeInterface>) => {
        await updateRecipe(id, updatedRecipe, isOnline);
    };

    const handleGetAllRecipes = async (filters: FilterInterface) => {
        return await getAllRecipes(filters, isOnline);
    };

    const handleGetRecipeById = async (id: string) => {
        return await getRecipeById(id, isOnline);
    };

    const handleCreateRecipe = async (newRecipe: RecipeInterface) => {
        await createRecipe(newRecipe, isOnline);
    };

    const handleDeleteRecipe = async (id: string, isPublic: boolean) => {
        await deleteRecipe(id, isOnline, isPublic, currentUser);
    };

    const handleCheckRecipeLikes = async (id: string) => {
        return await checkRecipeLikes(id, isOnline, currentUser);
    }

    const handleChangeRecipeVisibility = async (recipe: Partial<RecipeInterface>, visibility: boolean) => {
        return await changeRecipeVisibility(recipe, visibility, isOnline);
    }

    const handleGetUsersRecipes = async () => {
        return await getUsersRecipes(currentUser, isOnline);
    }

    const handleGetUsersSavedRecipes = async () => {
        return await getUsersSavedRecipes(currentUser, isOnline);
    }

    return {
        handleUpdateRecipeFavorites,
        handleUpdateRecipe,
        handleGetAllRecipes,
        handleGetRecipeById,
        handleCreateRecipe,
        handleDeleteRecipe,
        handleCheckRecipeLikes,
        handleChangeRecipeVisibility,
        handleGetUsersRecipes,
        handleGetUsersSavedRecipes
    };
}
