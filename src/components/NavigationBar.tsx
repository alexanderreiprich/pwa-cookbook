import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItemButton,
  ListItemText
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ScrollToHide from "./ScrollToHide";
import React, { useState } from 'react';
// export default function NavigationBar() {
//   function openNav() {
//     let sidebar: HTMLElement = document.getElementById("sidebar")!;
//     sidebar.style.width = "200px";
//   }

//   function closeNav() {
//     let sidebar: HTMLElement = document.getElementById("sidebar")!;
//     sidebar.style.width = "0";
//   }

//   return <div className="navigationBarContainer">
//     <div id="sidebar" className="sidebar">
//       <a href="javascript:void(0)" className="closeBtn" onClick={closeNav}>
//         &times;
//       </a>
//       <a href="#">Your Recipes</a>
//       <a href="#">Explore Recipes</a>
//       <a href="#">App Preferences</a>
//     </div>
//     <button className="openBtn" onClick={openNav}>&#9776; Open</button>
//   </div>;
// }

export default function NavigationBar({title}: {title: string}) {

  const [open, setOpen]= useState(false);
  const toggleDrawer = () => {
    setOpen(!open);
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <ScrollToHide threshold={0}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            <Drawer open={open} onClose={toggleDrawer}>
              <List>
                <ListItemButton component="a" href="/">
                  <ListItemText primary="Rezepte durchsuchen" />
                </ListItemButton>
                <ListItemButton component="a" href="/">
                  <ListItemText primary="Meine Rezepte" />
                </ListItemButton>
                <ListItemButton component="a" href="/">
                  <ListItemText primary="Einstellungen" />
                </ListItemButton>
              </List>
            </Drawer>
          </Toolbar>
        </AppBar>
      </ScrollToHide>
    </Box>
  );
}
