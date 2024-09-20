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
      <Button variant="contained" color="primary" onClick={handleClick} style={{width: '100%'}}>
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
        PaperProps={{
          style: {padding: '10px', marginTop: '5px'}
        }}
      >
        <FormControl fullWidth variant="outlined" margin="normal">
          <InputLabel id="sort-label">Sortieren nach</InputLabel>
          <Select
            labelId="sort-label"
            value={sortBy}
            onChange={(e) => {handleSortChange(e); handleClose();}}
            label="Sortieren nach"
          >
            <MenuItem key={SortOrder.NAMEASC} value={SortOrder.NAMEASC}>Name (aufsteigend)</MenuItem>
            <MenuItem key={SortOrder.NAMEDSC} value={SortOrder.NAMEDSC}>Name (absteigend)</MenuItem>
            <MenuItem key={SortOrder.FAVSASC} value={SortOrder.FAVSASC}>Favoriten (aufsteigend)</MenuItem>
            <MenuItem key={SortOrder.FAVSDSC} value={SortOrder.FAVSDSC}>Favoriten (absteigend)</MenuItem>
            <MenuItem key={SortOrder.DATEASC} value={SortOrder.DATEASC}>Datum (aufsteigend)</MenuItem>
            <MenuItem key={SortOrder.DATEDSC} value={SortOrder.DATEDSC}>Datum (absteigend)</MenuItem>
          </Select>
        </FormControl>
      </Popover>
    </div>
  );
};

export default SortComponent;
