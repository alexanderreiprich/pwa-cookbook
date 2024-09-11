import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Button, Popover } from "@mui/material";
import { SortOrder } from "../interfaces/SortOrderEnum";

interface SortComponentProps {
  sortBy: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
}

const SortComponent: React.FC<SortComponentProps> = ({ sortBy, onSortOrderChange }) => {
  const handleSortChange = (event: any) => {
    onSortOrderChange(event.target.value as SortOrder);
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
            <MenuItem value={SortOrder.NAMEASC}>Name (aufsteigend)</MenuItem>
            <MenuItem value={SortOrder.NAMEDSC}>Name (absteigend)</MenuItem>
            <MenuItem value={SortOrder.FAVSASC}>Favoriten (aufsteigend)</MenuItem>
            <MenuItem value={SortOrder.FAVSDSC}>Favoriten (absteigend)</MenuItem>
            <MenuItem value={SortOrder.DATEASC}>Datum (aufsteigend)</MenuItem>
            <MenuItem value={SortOrder.DATEDSC}>Datum (absteigend)</MenuItem>
          </Select>
        </FormControl>
      </Popover>
    </div>
  );
};

export default SortComponent;
