import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useDbActionHandler } from '../db/dbActionHandler'; // Adjust path as needed
import { RecipeInterface } from '../interfaces/RecipeInterface';
import { LikesInterface } from '../interfaces/LikesInterface';
interface FavoritesButtonProps {
  favorites: number;
  recipe: RecipeInterface;
}

export default function FavoritesButton({ favorites, recipe }: FavoritesButtonProps) {
  const { handleUpdateRecipeFavorites, handleCheckRecipeLikes } = useDbActionHandler();
  // State to manage the favorites count
  const [localFavorites, setLocalFavorites] = useState(favorites);
  // State to manage the liked state
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  checkLikes();

  function changeLikeState() {
    if (hasLiked) {
      if(localFavorites > 0){
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
    await handleCheckRecipeLikes(recipe.id, recipe.public).then( (likes: LikesInterface) => {
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
