import React, { useState } from "react";
import { TextField, Select, MenuItem, Button, FormControl, InputLabel, Input, Chip, Slider, Box, Popover, Typography } from "@mui/material";

import { TAG } from "../interfaces/TagEnum";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";

const FilterComponent = ({ onApplyFilters }: {onApplyFilters: any}) => {
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [timeMinFilter, setMinTime] = useState();
  const [timeMaxFilter, setMaxTime] = useState();

  const handleCategoryChange = (event: any) => {
    setCategoryFilter(event.target.value);
  };

  const handleDifficultyChange = (event: any) => {
    setDifficultyFilter(event.target.value);
  }

  const handleMinTimeChange = (event: any) => {
    setMinTime(event.target.value);
  }

  const handleMaxTimeChange = (event: any) => {
    setMaxTime(event.target.value);
  }

  const handleApplyFilters = () => {
    onApplyFilters({ tags: categoryFilter, difficulty: difficultyFilter, timeMin: timeMinFilter, timeMax: timeMaxFilter, user: undefined, favorite: undefined });
  };

  const handleResetFilters = () => {
    setCategoryFilter([]);
    setDifficultyFilter('');
    setMinTime(undefined);
    setMaxTime(undefined);
    onApplyFilters({ tags: [], difficulty: '', timeMin: undefined, timeMax: undefined, user: undefined, favorite: undefined });
  }

  const tags: string[] = Object.keys(TAG).slice(Object.keys(TAG).length / 2);
  const difficulties: string[] = Object.keys(DIFFICULTY).slice(Object.keys(DIFFICULTY).length / 2);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div style={{paddingBottom: '15px'}}>
      <Button variant="contained" color="primary" onClick={handleClick} style={{width: '100%'}}>
        Rezepte filtern
      </Button>
      <Popover 
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}  
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        open={open}
        id={id}
        anchorEl={anchorEl}
        onClose={handleClose}
        PaperProps={{
          style: { padding: '10px', marginTop: '5px' },
        }}
      >
        <FormControl fullWidth variant="standard" margin="normal">
          <InputLabel>Schlagwörter</InputLabel>
          <Select
            multiple
            value={categoryFilter}
            onChange={handleCategoryChange}
            input = {<Input id="select-multiple-chip" />}
            renderValue = {selected => (
              <div className="filterChips">
                {selected.map(value => (
                  <Chip key={value} label={value} />
                ))}
              </div>
            )}
          >
            {tags.map((tag) => (
              <MenuItem key={tag} value={tag}>{tag}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth variant="standard" margin="normal">
          <InputLabel>Schwierigkeit</InputLabel>
          <Select
            value={difficultyFilter}
            onChange={handleDifficultyChange}
          >
            {difficulties.map((difficulty) => (
              <MenuItem key={difficulty} value={difficulty}>{difficulty}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <Typography gutterBottom>
            Dauer in Minuten
          </Typography>
          <Box> 
            <TextField label="Min" type="number" value={timeMinFilter} onChange={handleMinTimeChange}/>
            <TextField label="Max" type="number" value={timeMaxFilter} onChange={handleMaxTimeChange}/>
          </Box>
        </FormControl>
        <Button variant="contained" color="primary" onClick={() => {handleApplyFilters(); handleClose();}}>
          Anwenden
        </Button>
        <Button variant="contained" color="error" onClick={() => {handleResetFilters(); handleClose();}} style={{marginLeft: '5px'}}>
          Zurücksetzen
        </Button>
      </Popover>
    </div>
  );
};

export default FilterComponent;
