import * as React from 'react';
import Button from '@mui/material/Button';

export default function RecipeElement({ name, image }: { name: string, image: string }) {
  return <div onClick={ () => {
    //TODO: open recipe in detailed view
  }}>
    <img id="recipeImage" src={ image }></img>
    <p id="recipeName">{ name }</p>
  </div>;
}