import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from './Authentication';
import { useRecipeActions } from '../db/useRecipes'; // Adjust path as needed
import { RecipeInterface } from '../interfaces/RecipeInterface';
interface FavoritesButtonProps {
  favorites: number;
  recipe: RecipeInterface;
}

export default function FavoritesButton({ favorites, recipe }: FavoritesButtonProps) {
  const { currentUser } = useAuth();
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

  function checkState() {
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

  async function checkLikes () {
    await handleCheckRecipeLikes(recipe.id).then(likes => {
      setHasLiked(likes)
    });
  }

  return (
    <div>
      <Button
        color="secondary"
        variant={hasLiked ? 'contained' : 'text'}
        startIcon={<FavoriteIcon />}
        onClick={checkState}
      >
        {localFavorites}
      </Button>
    </div>
  );
}
