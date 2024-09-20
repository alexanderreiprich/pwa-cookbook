import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import "../style/Login.css";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "..";

export default function SignUp() {
  let navigate = useNavigate();
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    setEmailError("");
    setUsernameError("");
    const data = new FormData(event.currentTarget);
    const auth = getAuth();

    createUserWithEmailAndPassword(
      auth,
      data.get("email")!.toString(),
      data.get("password")!.toString()
    )
      .then(async (userCredential) => {
        let username = data.get("username")!.toString();
        await setDoc(doc(db, "users", username), {
          email: data.get("email")!.toString(),
          favorites: [],
          created_recipes: [],
        });
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });
        navigate("/login");
      })
      .catch((error) => {
        const errorCode = error.code;
        switch (errorCode) {
          case "auth/email-already-in-use":
            setEmailError("Diese E-Mail-Adresse wird bereits verwendet.");
            break;
          case "auth/weak-password":
            setPasswordError(
              "Dieses Password ist zu kurz. Bitte versuche ein anderes."
            );
            break;
          default:
            setEmailError("Ein unerwarteter Fehler ist aufgetreten.");
            break;
        }
      });
  };

  const handleUsernameInput = async () => {
    let chosenUsernameInput = document.getElementById(
      "username"
    )! as HTMLInputElement;
    let chosenUsername = chosenUsernameInput.value;
    if (chosenUsername != "") {
      // avoid edge case of invalid database reference
      const docRef = doc(db, "users", chosenUsername);
      const docSnap = await getDoc(docRef);
      const submitButton = document.getElementById(
        "submitBtn"
      )! as HTMLButtonElement;
      if (docSnap.exists()) {
        submitButton.disabled = true;
        setUsernameError("Nutzername bereits vergeben.");
      } else {
        submitButton.disabled = false;
        setUsernameError("");
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
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
          Registrieren
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="username"
                name="username"
                required
                fullWidth
                id="username"
                label="Nutzername"
                autoFocus
                onBlur={handleUsernameInput}
              />
            </Grid>
            <label className="errorLabel">{usernameError}</label>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="E-Mail-Addresse"
                name="email"
                autoComplete="email"
              />
            </Grid>
            <label className="errorLabel">{emailError}</label>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Passwort"
                type="password"
                id="password"
                autoComplete="new-password"
              />
            </Grid>
            <label className="errorLabel">{passwordError}</label>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            id="submitBtn"
          >
            Registrieren
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" variant="body2">
                Bereits einen Account erstellt? Hier anmelden!
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
