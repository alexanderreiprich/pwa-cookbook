import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import NavigationBar from "../components/NavigationBar";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import "../style/Login.css";

export default function SignIn() {
  let navigate = useNavigate();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    signInWithEmailAndPassword(auth, data.get("email")!.toString(), data.get("password")!.toString()) // TODO: is this the correct way to handle user potentially being null?
    .then((userCredential) => {
      const user = userCredential.user;
      navigate("/");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode + "  " + errorMessage);
      switch (errorCode) {
        case "auth/invalid-email": 
          setEmailError("Diese E-Mail-Adresse scheint nicht zu exisitieren.");
          break;
        case "auth/invalid-login-credentials":
          setPasswordError("Diese E-Mail-Passwort-Kombination ist falsch.");
          break;
        case "auth/too-many-requests":
          setPasswordError("Zu viele Anfragen, bitte versuche es später noch einmal.");
          break;
        default:
          setEmailError("Ein unerwarteter Fehler ist aufgetreten.");
          break;
      }
    });
  };

  const auth = getAuth();
  

  return (
    <Container component="main" maxWidth="xs">
      <NavigationBar title="Login" />
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Anmelden
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-Mail-Adresse"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <label className="errorLabel">{emailError}</label>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Passwort"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <label className="errorLabel">{passwordError}</label>
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Daten für die nächste Anmeldung speichern"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Anmelden
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Passwort vergessen?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Kein Account? Hier registrieren!"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
