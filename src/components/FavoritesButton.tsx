import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from './Authentication';
import { useRecipeActions } from '../db/useRecipes'; // Adjust path as needed
import { RecipeInterface } from '../interfaces/RecipeInterface';
import { useNetworkStatus } from '../helpers/NetworkStatusProvider';
import { LikesInterface } from '../interfaces/LikesInterface';
interface FavoritesButtonProps {
  favorites: number;
  recipe: RecipeInterface;
}

export default function FavoritesButton({ favorites, recipe }: FavoritesButtonProps) {
  const { handleUpdateRecipeFavorites } = useRecipeActions();
  const { handleCheckRecipeLikes } = useRecipeActions();
  // State to manage the favorites count
  const [localFavorites, setLocalFavorites] = useState(favorites);
  // State to manage the liked state
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  checkLikes();
  useEffect(() => {
    // Update local favorites if the prop changes
    setLocalFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, []);

  function changeLikeState() {
    if (hasLiked) {
      if(localFavorites > 1){
      setLocalFavorites(localFavorites - 1);
      handleUpdateRecipeFavorites(recipe, localFavorites - 1, false);
      } else {
        handleUpdateRecipeFavorites(recipe, localFavorites, false);
      }
    } else {
      setLocalFavorites(localFavorites + 1);
      handleUpdateRecipeFavorites(recipe, localFavorites + 1, true);
    }
    setHasLiked(!hasLiked);
  }

  const handleMessage = async (event: MessageEvent) => {
    if (event.data && event.data.type === 'NETWORK_STATUS_PROCESSED') {
      await checkLikes();
    }
  };

  async function checkLikes () {
    await handleCheckRecipeLikes(recipe.id).then( (likes: LikesInterface) => {
      setHasLiked(likes.likes);
      setLocalFavorites(likes.numberOfLikes);
    });
  }

  return (
    <div>
      <Button
        color="secondary"
        variant={hasLiked ? 'contained' : 'text'}
        startIcon={<FavoriteIcon />}
        onClick={changeLikeState}
      >
        {localFavorites}
      </Button>
    </div>
  );
}
