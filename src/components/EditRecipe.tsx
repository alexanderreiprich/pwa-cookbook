import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { DocumentData } from "firebase/firestore";
import { MenuItem, Paper, Select, Stack, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { createRecipe, deleteRecipe, editRecipe } from "../helpers/dbHelper";
import { Key, useRef, useState } from "react";
import { TAG } from "../interfaces/TagEnum";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

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
  overflowY: 'auto',
};

const boxStyle = { mb: 2, p: 2, border: '1px solid', borderRadius: '8px' };

const buttonBoxStyle = {
  position: 'relative', 
     float: 'right',
  '@media (max-width: 600px)': {
      float: 'none',
      marginTop: '16px'
  },
};

const mobileIngredientsStyles = {
  display: 'none',
  '@media (max-width: 600px)': {
    display: 'block',
    '& .table-container': {
      display: 'none',
    },
    '& .mobile-view': {
      display: 'block',
    },
  },
};

const desktopIngredientsStyles = {
  display: 'block',
  '@media (max-width: 600px)': {
    display: 'none',
  },
};

// Custom styled Select to highlight selected items
const CustomSelect = styled(Select)(() => ({
  '& .MuiSelect-select': {
    height: 'auto'

  },
  '& .MuiMenuItem-root': {
    '&.Mui-selected': {
      backgroundColor: '#d3d3d3'
    },
    '&.Mui-selected:hover': {
      backgroundColor: '#d3d300',
    },
  },
}));

// Todo: Fix background scroll
export default function EditRecipe( {recipe, isNew}: {recipe: DocumentData, isNew: boolean}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
      setOpen(true);
      console.log(recipe.image);
      
    }
  const idRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const numberOfPeopleRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  // const [image, setImage] = useState<File | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [steps, setSteps] = useState<string[]>(recipe.steps);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<TAG[]>(recipe.tags);
  const [ingredients, setIngredients] = useState<IngredientInterface[]>(recipe.ingredients);
  const [difficulty, setDifficulty] = useState<DIFFICULTY>(recipe.difficulty);
  
  const allTags = Object.keys(TAG);
  const allDifficulties = Object.keys(DIFFICULTY);
  
  const handleClose = () => {
    setOpen(false);
  }

  const handleDelete = () => {
    deleteRecipe(recipe.id);
  }

  const handleSave = () => { 
    let updatedRecipe: RecipeInterface = {
      id: idRef.current && isNew ? idRef.current.value : recipe.id,
      name: nameRef.current ? nameRef.current.value : recipe.name,
      ingredients: ingredients,
      number_of_people: numberOfPeopleRef.current ? numberOfPeopleRef.current.value : recipe.number_of_people,
      time: timeRef.current ? timeRef.current.value : recipe.time,
      image: imageRef.current ? imageRef.current.value : recipe.image,
      steps: steps,
      description: descriptionRef.current ? descriptionRef.current.value : recipe.description,
      difficulty: difficulty,
      tags: tags,
      favorites: recipe.favorites,
      author: recipe.author,
      date_create: recipe.date_create
    }
    isNew ? createRecipe(updatedRecipe) : editRecipe(recipe.id, updatedRecipe);
    handleClose();
  }

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, '']); // Füge ein neues, leeres Textfeld hinzu
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  
  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     setImage(e.target.files[0]);
  //   }
  // };

  const handleChange = (index: number, field: keyof IngredientInterface, value: any) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleAddRow = () => {
    setIngredients([...ingredients, { name: '', amount: 0, unit: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };


  return (
    <div>
      <h1>
        <Button onClick={handleOpen}>{isNew ? "Rezept erstellen" : "Rezept bearbeiten"}</Button>
      </h1>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >


        {/* General Information */}
          
        <Box sx={style}>
          <div style={{ display: 'flex', justifyContent: 'end', marginBottom: '16px'}}>
            <Button onClick={handleClose} variant="outlined" startIcon={<CloseIcon />}>Abbrechen</Button>
          </div>
          <Box sx={boxStyle}>
            <Typography paddingBottom={2} id="modal-modal-title" variant="h6" component="h2">
              Allgemeine Informationen
            </Typography>
            <Stack spacing={{ xs: 2, sm: 2, md: 4 }} paddingBottom={2}>
              <TextField size="small" inputRef={idRef} disabled={!isNew} required id="id" label="Id des Rezeptes" defaultValue={recipe.id}/>
              <TextField size="small" inputRef={nameRef} required id="name" label="Name des Rezeptes" defaultValue={recipe.name}/>
              <TextField size="small" multiline required inputRef={descriptionRef} id="description" label="Beschreibung des Rezeptes" defaultValue={recipe.description}/>
              <TextField size="small" inputRef={numberOfPeopleRef} required type="number" id="numberOfPeople" label="Anzahl an Personen" defaultValue={recipe.number_of_people}/>
              
              <CustomSelect
                size="small"
                name="Schwierigkeit"
                value={DIFFICULTY[difficulty]}
                onChange={(event) => setDifficulty(event.target.value as DIFFICULTY)}
                displayEmpty
                fullWidth
                variant="outlined"
                renderValue={(selected) => {
                  const selectedDifficulty = selected as DIFFICULTY;
                  return (
                    <div>
                        <span style={{ margin: '2px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#d3d3d3' }}>
                          {selectedDifficulty}
                        </span>
                    </div>
                  );
                }}
              >
                {allDifficulties.map((level) => (
                  <MenuItem key={level} value={level}>
                    {DIFFICULTY[parseInt(level)]}
                  </MenuItem>
                ))}
              </CustomSelect>
              <CustomSelect
              size="small"
              multiple
              value={tags}
              onChange={(event) => setTags(event.target.value as TAG[])}
              renderValue={(selected) => {
                const selectedTags = selected as TAG[];
                return (
                  <div>
                    {selectedTags.map((value) => (
                      <span key={value} style={{ margin: '2px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#d3d3d3' }}>
                        {TAG[value]}
                      </span>
                    ))}
                  </div>
                );
              }}
              displayEmpty
              fullWidth
              variant="outlined"
            >
              {allTags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {TAG[parseInt(tag)]}
                </MenuItem>
              ))}
            </CustomSelect>
              </Stack>
          </Box>

          {/* Upload image via file */}

          {/* <Box sx={boxStyle}>
            <Typography paddingBottom={2} id="modal-modal-title" variant="h6" component="h2">
                Neues Bild hochladen
              </Typography>
              <input
                accept="image/*"
                type="file"
                onChange={handleImageChange}
              />
              
              {image && (
                <div>
                  <p>Hochgeladenes Bild: {image.name}</p>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200 }}
                  />
                </div>
              )}
          </Box> */}

          <TextField size="small" inputRef={imageRef} id="image-link" label="Link auf Bild des Rezeptes" defaultValue={recipe.image}/>

          {/* Ingredients */}

          <Box sx={boxStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Zutaten bearbeiten
            </Typography>
            <Box sx={desktopIngredientsStyles}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Menge</TableCell>
                    <TableCell>Einheit</TableCell>
                    <TableCell>Aktionen</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(ingredients as Array<IngredientInterface>).map((ingredient: IngredientInterface, index) => (
                    <TableRow key={index as Key}>
                      <TableCell>
                        <TextField
                          value={ingredient.name}
                          onChange={(e) => handleChange(index, 'name', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={ingredient.amount}
                          onChange={(e) => handleChange(index, 'amount', parseFloat(e.target.value))}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                      <TextField
                          value={ingredient.unit}
                          onChange={(e) => handleChange(index, 'unit', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleRemoveRow(index)}>Entfernen</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
            {/* Mobile View */}
            <Box sx={mobileIngredientsStyles} className="mobile-view">
              {ingredients.map((ingredient: IngredientInterface, index) => (
                <Box key={index} sx={boxStyle}>
                  <TextField
                    label="Name"
                    value={ingredient.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    type="number"
                    label="Menge"
                    value={ingredient.amount}
                    onChange={(e) => handleChange(index, 'amount', parseFloat(e.target.value))}
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Einheit"
                    value={ingredient.unit}
                    onChange={(e) => handleChange(index, 'unit', e.target.value)}
                    fullWidth
                    sx={{ mb: 1 }}
                  />
                  <Button onClick={() => handleRemoveRow(index)}>Entfernen</Button>
                </Box>
              ))}
            </Box>
            <Button onClick={handleAddRow} variant="contained" color="primary" sx={{ mt: 2 }}>
              Zeile hinzufügen
            </Button>
          </Box>



  	      {/* Steps */}

          <Box  sx={boxStyle}>
            <Typography paddingBottom={2} id="modal-modal-title" variant="h6" component="h2">
              Schritte
            </Typography>
            {steps.map((step, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  label={`Schritt ${index + 1}`}
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                />
                <Button
                  onClick={() => removeStep(index)}
                  disabled={steps.length === 1} // Disables removing the last step
                >
                  Entfernen
                </Button>
              </div>
            ))}
            <Button onClick={addStep} variant="contained" color="primary" sx={{ mt: 2 }}>Schritt hinzufügen</Button>
          </Box>
          <div>
            <Button onClick={handleDelete} variant="outlined" color="error" startIcon={<DeleteIcon />}>Rezept löschen</Button>
            <Box sx={buttonBoxStyle}>
              <Button onClick={handleClose} variant="outlined" startIcon={<CloseIcon />} style={{ marginRight: '16px'}}>Abbrechen</Button>
              <Button onClick={handleSave} variant="contained" color="primary">Speichern</Button>
            </Box>
          </div>
        </Box>
      </Modal>
    </div>
  );
}