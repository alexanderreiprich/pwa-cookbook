import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import "../style/Login.css";
import { BasePage } from "./BasePage";

export default function SignIn() {
  let navigate = useNavigate();
  let location = useLocation();
  let from = location.state?.from?.pathname + location.state?.from?.search || "/";
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    signInWithEmailAndPassword(
      auth,
      data.get("email")!.toString(),
      data.get("password")!.toString()
    )
      .then((userCredential) => {
        const user = userCredential.user;
        navigate(from);
      })
      .catch((error) => {
        const errorCode = error.code;
        console.error(errorCode, error.message);
        switch (errorCode) {
          case "auth/invalid-email":
            setEmailError("Diese E-Mail-Adresse scheint nicht zu exisitieren.");
            break;
          case "auth/invalid-login-credentials":
            setPasswordError("Diese E-Mail-Passwort-Kombination ist falsch.");
            break;
          case "auth/too-many-requests":
            setPasswordError(
              "Zu viele Anfragen, bitte versuche es später noch einmal."
            );
            break;
          default:
            setEmailError("Ein unerwarteter Fehler ist aufgetreten.");
            break;
        }
      });
  };

  const auth = getAuth();

  return (
    <BasePage title="Login">
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
            Anmelden
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Anmelden
            </Button>
            <Grid container>
              <Grid item>
                <Link href="#/signup" variant="body2">
                  {"Kein Account? Hier registrieren!"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </BasePage>
  );
}
