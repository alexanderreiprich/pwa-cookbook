import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ScrollToHide from "./ScrollToHide";
import { useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../provider/Authentication";
import { logout } from "../db/dbActions";

import "../style/NavigationBar.css";

export default function NavigationBar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        logout();
        navigate("/login");
      })
      .catch((error) => {
        alert("Etwas ist schiefgegangen, bitte lade die Seite neu.");
      });
  };

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
                  <ListItemText className="navigationBarElement" primary="Rezepte durchsuchen" />
                </ListItemButton>
                <ListItemButton component="a" href="/my_recipes">
                  <ListItemText className="navigationBarElement" primary="Meine Rezepte" />
                </ListItemButton>
                <ListItemButton component="a" href="/favorite_recipes">
                  <ListItemText className="navigationBarElement" primary="Favorisierte Rezepte" />
                </ListItemButton>
                {Boolean(currentUser) ? (
                  <ListItemButton component="button" onClick={handleLogout}>
                    <ListItemText className="navigationBarElement" primary="Abmelden" />
                  </ListItemButton>
                ) : (
                  <ListItemButton component="a" href="/login">
                    <ListItemText className="navigationBarElement" primary="Anmelden" />
                  </ListItemButton>
                )}
              </List>
            </Drawer>
            { currentUser ? `Angemeldet als ${currentUser.displayName ? currentUser.displayName : currentUser.email}`: "Abgemeldet" }
          </Toolbar>
        </AppBar>
      </ScrollToHide>
      <Toolbar></Toolbar>
    </Box>
  );
}
