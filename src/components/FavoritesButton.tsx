import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { User } from 'firebase/auth';
import { useAuth } from './Authentication';
import { useRecipeActions } from '../helpers/useRecipes'; // Adjust path as needed

interface FavoritesButtonProps {
  favorites: number;
  recipeId: string;
}

export default function FavoritesButton({ favorites, recipeId }: FavoritesButtonProps) {
  const { currentUser } = useAuth();
  const { handleUpdateRecipeFavorites } = useRecipeActions();

  // State to manage the favorites count
  const [localFavorites, setLocalFavorites] = useState(favorites);

  useEffect(() => {
    // Update local favorites if the prop changes
    setLocalFavorites(favorites);
  }, [favorites]);

  function checkState() {
    if (hasLiked(currentUser)) {
      setLocalFavorites(localFavorites - 1);
      handleUpdateRecipeFavorites(recipeId, localFavorites - 1);
    } else {
      setLocalFavorites(localFavorites + 1);
      handleUpdateRecipeFavorites(recipeId, localFavorites + 1);
    }
  }

  function hasLiked(user: User | null): boolean {
    // TODO: Implement logic to determine if the user has liked the recipe
    // This might involve checking user-specific data or storing liked recipe IDs
    return false; // Placeholder
  }

  return (
    <div>
      <Button
        color="secondary"
        variant={hasLiked(currentUser) ? 'contained' : 'text'}
        startIcon={<FavoriteIcon />}
        onClick={checkState}
      >
        {localFavorites}
      </Button>
    </div>
  );
}
