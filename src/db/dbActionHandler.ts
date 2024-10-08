import { useAuth } from '../provider/Authentication';
import { User } from "firebase/auth";
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
        const allowFirestorePush = Boolean(currentUser) && isOnline;
        if(isOnline && !currentUser) alert("Die Rezeptfavoriten werden nur lokal auf diesem Gerät gespeichert!");
        await updateRecipeFavorites(currentUser, recipe, newFavorites, likes, allowFirestorePush);
    };

    const handleUpdateRecipe = async (id: string, updatedRecipe: Partial<RecipeInterface>, image?: File) => {
        const allowFirestorePush = Boolean(currentUser) && isOnline;
        if(isOnline && !currentUser) alert("Das Rezeptupdate wird nur lokal auf diesem Gerät gespeichert!");
        await updateRecipe(id, updatedRecipe, allowFirestorePush, image);
    };

    const handleGetAllRecipes = async (filters: FilterInterface) => {
        return await getAllRecipes(filters, isOnline);
    };

    const handleGetRecipeById = async (id: string) => {
        return await getRecipeById(id, isOnline);
    };

    const handleCreateRecipe = async (newRecipe: RecipeInterface, image?: File) => {
        const allowFirestorePush = Boolean(currentUser) && isOnline;
        if(isOnline && !currentUser) alert("Das Rezept wird nur lokal auf diesem Gerät gespeichert!");
        await createRecipe(newRecipe, allowFirestorePush, image);
    };

    const handleDeleteRecipe = async (id: string, isPublic: boolean) => {
        const allowFirestorePush = Boolean(currentUser) && isOnline;
        if(!isOnline || !currentUser) alert("Das Rezept wird nur lokal von diesem Gerät gelöscht! Wurde es veröffentlicht, so brauchst du eine Internetverbindung zum löschen und damit depublizieren");
        await deleteRecipe(id, allowFirestorePush, isPublic);
    };

    const handleCheckRecipeLikes = async (id: string, isPublic: boolean) => {
        return await checkRecipeLikes(id, isPublic, isOnline, currentUser);
    }

    const handleChangeRecipeVisibility = async (id: string, visibility: boolean) => {
        const allowFirestorePush = Boolean(currentUser) && isOnline;
        return await changeRecipeVisibility(id, visibility, allowFirestorePush, currentUser);
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
