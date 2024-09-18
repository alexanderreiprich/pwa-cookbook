import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { DocumentData } from "firebase/firestore";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { Key, useEffect } from "react";
import { TAG } from "../interfaces/TagEnum";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import CloseIcon from '@mui/icons-material/Close';
import Timer from "./Timer";

import "../style/RecipeCookMode.css";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80vw",
  height: "80vh",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  pb: 0,
  overflowY: 'auto',
};

const boxStyle = { mb: 2, p: 2, border: '1px solid', borderRadius: '8px' };

// Todo: Fix background scroll
export default function RecipeCookMode( {recipe, numberOfServings}: {recipe: DocumentData, numberOfServings: number}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  }
  
  const handleClose = () => {
    setOpen(false);
  }

  const adjustedIngredients = recipe.ingredients.map((ingredient: IngredientInterface) => {
    return {
      ...ingredient,
      amount: (ingredient.amount / recipe.number_of_people) * numberOfServings
    };
  })

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    }
  }, [open]);

  return (
    <div>
        <div style={{ position: "fixed", right: 0, bottom: 0, paddingBottom: 6, paddingRight: 6}}>
        <Button onClick={handleOpen} variant="contained" >Kochmodus starten</Button>
        </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >


        {/* General Information */}
          
        <Box sx={style}>
            <div style={{ display: 'flex', justifyContent: 'end', marginBottom: '16px'}}>
                <Button onClick={handleClose} variant="outlined" startIcon={<CloseIcon />}>Kochmodus beenden</Button>
            </div>
            <Box sx={boxStyle} id="recipeHead">
                <h1>{recipe.name}</h1>
                <div>
                    <Button style={{ paddingLeft: 0, marginLeft: 0, minWidth: 0 }}>{DIFFICULTY[recipe.difficulty]}</Button>
                    {recipe.tags.map((tag: TAG) => <Button key={TAG[tag] + "-cookmode" as Key}> {TAG[tag]}</Button>)}
                </div>
                <p className="text"> Gesamtdauer: {recipe.time} min</p>
                <p className="text">{recipe.description}</p>
            </Box>

            <Box sx={boxStyle} id="recipeContent">
            <h2>Zutaten</h2>
            <p className="text">Anzahl der Personen: { numberOfServings }</p>
            <ul>
                {adjustedIngredients.map((ingredient: IngredientInterface) =>
                <li key={ingredient.name  + "-cookmode" as Key} className="text">{ingredient.name} {ingredient.amount.toFixed(2)} {ingredient.unit}</li>
                )}
            </ul>
            <h2>Schritte</h2>
            <ol>
                {recipe.steps.map((value: String) => <li style={{marginBottom: '20px'}}className="text" key={value as Key}>{value}</li>)}
            </ol>
            </Box>
            <Timer defaultTime={recipe.time * 60}></Timer>
        </Box>
        
      </Modal>
    </div>
  );
}