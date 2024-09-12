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
import { useNetworkStatus } from "../provider/NetworkStatusProvider";

export default function NavigationBar({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const auth = getAuth();
  const navigate = useNavigate();

  const { isOnline } = useNetworkStatus();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
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
                  <ListItemText primary="Rezepte durchsuchen" />
                </ListItemButton>
                <ListItemButton component="a" href="/my_recipes">
                  <ListItemText primary="Meine Rezepte" />
                </ListItemButton>
                <ListItemButton component="a" href="/favorite_recipes">
                  <ListItemText primary="Favorisierte Rezepte" />
                </ListItemButton>
                {isOnline ? (
                  <ListItemButton component="button" onClick={handleLogout}>
                    <ListItemText primary="Abmelden" />
                  </ListItemButton>
                ) : (
                  <ListItemButton component="a" href="/login">
                    <ListItemText primary="Anmelden" />
                  </ListItemButton>
                )}
              </List>
            </Drawer>
          </Toolbar>
        </AppBar>
      </ScrollToHide>
      <Toolbar></Toolbar>
    </Box>
  );
}
