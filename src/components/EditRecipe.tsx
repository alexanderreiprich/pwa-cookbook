import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { RecipeInterface } from "../interfaces/RecipeInterface";

import { DocumentData, Timestamp } from "firebase/firestore";
import { MenuItem, Paper, Select, Stack, styled, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";

import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { useRecipeActions } from "../db/useRecipes";
import { Key, useRef, useState } from "react";
import { TAG } from "../interfaces/TagEnum";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

import { useNavigate } from 'react-router-dom';
import { checkRecipeVersioning } from "../helpers/synchDBHelper";

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
  const [hasError, setHasError] = useState(false);
  
  const allTags = Object.keys(TAG);
  const allDifficulties = Object.keys(DIFFICULTY);

  const navigate = useNavigate();

  const { 
    handleUpdateRecipe, 
    handleCreateRecipe, 
    handleDeleteRecipe,
    handleGetRecipeById 
} = useRecipeActions();
  
  const handleClose = () => {
    setOpen(false);
  }

  const deleteRecipe = async () => {
    if (recipe.id) {
        await handleDeleteRecipe(recipe.id);
    }
};

const createRecipe = async (newRecipe: RecipeInterface) => {
  if (newRecipe) {
      await handleCreateRecipe(newRecipe);
  }
};

const updateRecipe = async (id: string, updatedRecipe: RecipeInterface, oldDateEdit: Timestamp) => {
  let canUpdate = await checkRecipeVersioning(id, oldDateEdit);
  if (canUpdate) {
    if (id && updatedRecipe) {
        await handleUpdateRecipe(id, updatedRecipe);
    }
  } else {
    alert("In der Online Datenbank wurde eine aktuellere Version des Rezeptes gefunden. Bitte lade die Seite neu, bevor du das Rezept editierst");
  }
};

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

  const handleIdCheck = async (id: string): Promise<boolean> => {
    if (await handleGetRecipeById(id)) {
      return false;
    }
    return true
  }

  const handleSave = async () => { 
    let updatedRecipe: RecipeInterface = {
      id: idRef.current && isNew ? idRef.current.value : recipe.id,
      name: nameRef.current ? nameRef.current.value : recipe.name,
      ingredients: ingredients,
      number_of_people: numberOfPeopleRef.current ? parseInt(numberOfPeopleRef.current.value) : parseInt(recipe.number_of_people),
      time: timeRef.current ? parseInt(timeRef.current.value) : parseInt(recipe.time),
      image: imageRef.current ? imageRef.current.value : recipe.image,
      steps: steps,
      description: descriptionRef.current ? descriptionRef.current.value : recipe.description,
      difficulty: difficulty,
      tags: tags,
      favorites: recipe.favorites,
      author: recipe.author,
      date_create: recipe.date_create,
      date_edit: new Date(),
      public: recipe.public
    }
    if (isNew && await handleIdCheck(updatedRecipe.id) == false) {
      setHasError(true);
    }
    else {
      setHasError(false);
      isNew ? createRecipe(updatedRecipe) : updateRecipe(recipe.id, updatedRecipe);
      handleClose();
    }

      date_edit: Timestamp.now()
    }
    if (isNew && await handleIdCheck(updatedRecipe.id) == false) {
      setHasError(true);
    }
    else {
      setHasError(false);
      isNew ? createRecipe(updatedRecipe).then(() => handleReload()) : updateRecipe(recipe.id, updatedRecipe, recipe.date_edit).then(() => handleReload());
      handleClose();
    }
  }

  const handleDelete = () => {
    if(!isNew) deleteRecipe().then(() => {
      navigate('/my_recipes', {replace: true});
      handleReload();
    });
    handleClose();
  }

  const handleReload = () => {
    setTimeout(() => {
      window.location.reload();
    }, 0);
  }


  return (
    <div>
      <h1>
        <Button onClick={handleOpen} variant="outlined">{isNew ? "Rezept erstellen" : "Rezept bearbeiten"}</Button>
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
              <TextField size="small" inputRef={idRef} disabled={!isNew} required id="id" label="Id des Rezeptes" defaultValue={recipe.id} error={hasError} helperText={hasError? 'ID bereits vergeben' : ''}/>
              <TextField size="small" inputRef={nameRef} required id="name" label="Name des Rezeptes" defaultValue={recipe.name}/>
              <TextField size="small" multiline required inputRef={descriptionRef} id="description" label="Beschreibung des Rezeptes" defaultValue={recipe.description}/>
              <TextField size="small" inputRef={numberOfPeopleRef} required type="number" id="numberOfPeople" label="Anzahl an Personen" defaultValue={recipe.number_of_people}/>
              <TextField size="small" type="number" inputRef={timeRef} id="time" label="Dauer in Minuten" defaultValue={recipe.time}/>
              
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
              <TextField size="small" inputRef={imageRef} id="image-link" label="Link auf Bild des Rezeptes" defaultValue={recipe.image}/>
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