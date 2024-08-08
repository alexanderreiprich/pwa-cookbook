import * as React from 'react';
import Button from '@mui/material/Button';

export default function RecipeElement({ name, image }: { name: string, image: string }) {
  return <div className="recipeElement" onClick={ () => {
    //TODO: open recipe in detailed view
  }}>
    <img className="recipeImage" src={ image } />
    <p className="recipeName">{ name }</p>
  </div>;
}