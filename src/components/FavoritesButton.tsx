import { Button } from "@mui/material";
import { useAuth } from "./Authentication";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { User } from "firebase/auth";
import { updateRecipeFavorites } from "../helpers/dbHelper";

export default function FavoritesButton({favorites, recipeId} : {favorites: number, recipeId: String}) {
  const { currentUser } = useAuth();

  function checkState () {
    if(hasLiked(currentUser)){
      favorites --;
    } else {
      favorites ++;
    }
    updateRecipeFavorites(recipeId, favorites);
  }

  function hasLiked(user: User | null) {
    // Todo: implement 
    return false;
  }

  return(
    <div>
      <Button color="secondary" variant={hasLiked(currentUser) ? "contained" : "text"} startIcon={<FavoriteIcon />} onClick={checkState}>{favorites}</Button>
    </div>
  );
}