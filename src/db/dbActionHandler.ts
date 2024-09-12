import { useAuth } from '../provider/Authentication';
import { RecipeInterface } from '../interfaces/RecipeInterface';
import { useNetworkStatus } from '../provider/NetworkStatusProvider'; // Adjust path as needed
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
    getUsersFavoriteRecipes
} from "./dbActions";
import { FilterInterface } from '../interfaces/FilterInterface';

export function useDbActionHandler() {
    const { isOnline } = useNetworkStatus(); // Retrieve the current network status
    const { currentUser } = useAuth();

    const handleUpdateRecipeFavorites = async (recipe: RecipeInterface, newFavorites: number, likes: boolean) => {
        await updateRecipeFavorites(currentUser, recipe, newFavorites, likes, isOnline);
    };

    const handleUpdateRecipe = async (id: string, updatedRecipe: Partial<RecipeInterface>, image?: File) => {
        await updateRecipe(id, updatedRecipe, isOnline, image);
    };

    const handleGetAllRecipes = async (filters: FilterInterface) => {
        return await getAllRecipes(filters, isOnline);
    };

    const handleGetRecipeById = async (id: string) => {
        return await getRecipeById(id, isOnline);
    };

    const handleCreateRecipe = async (newRecipe: RecipeInterface, image?: File) => {
        await createRecipe(newRecipe, isOnline, image);
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

    const handleGetUsersFavoriteRecipes = async () => {
        return await getUsersFavoriteRecipes(currentUser, isOnline);
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
        handleGetUsersFavoriteRecipes
    };
}
