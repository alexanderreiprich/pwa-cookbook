import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Button, Popover } from "@mui/material";

interface SortComponentProps {
  sortBy: "nameAsc" | "favsAsc" | "dateAsc" | "nameDsc" | "favsDsc" | "dateDsc";
  onSortOrderChange: (order: "nameAsc" | "favsAsc" | "dateAsc" | "nameDsc" | "favsDsc" | "dateDsc") => void;
}

const SortComponent: React.FC<SortComponentProps> = ({ sortBy, onSortOrderChange }) => {
  const handleSortChange = (event: any) => {
    onSortOrderChange(event.target.value as "nameAsc" | "favsAsc" | "dateAsc" | "nameDsc" | "favsDsc" | "dateDsc");
  };

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
    <div>
      <Button variant="contained" color="primary" onClick={handleClick}>
        Rezepte sortieren
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
      >
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel id="sort-label">Sortieren nach</InputLabel>
          <Select
            labelId="sort-label"
            value={sortBy}
            onChange={(e) => {handleSortChange(e); handleClose();}}
            label="Sortieren nach"
          >
            <MenuItem value="nameAsc">Name (aufsteigend)</MenuItem>
            <MenuItem value="nameDsc">Name (absteigend)</MenuItem>
            <MenuItem value="favsAsc">Favoriten (aufsteigend)</MenuItem>
            <MenuItem value="favsDsc">Favoriten (absteigend)</MenuItem>
            <MenuItem value="dateAsc">Datum (aufsteigend)</MenuItem>
            <MenuItem value="dateDsc">Datum (absteigend)</MenuItem>
          </Select>
        </FormControl>
      </Popover>
    </div>
  );
};

export default SortComponent;
