import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/home";
import "./App.css";

import { FirestoreProvider } from "reactfire";

import "./style/RecipeElement.css";
import { db } from ".";
import BrowseRecipes from "./pages/BrowseRecipes";
import Recipe from "./pages/Recipe";
import Login from "./pages/Login";
import Register from "./pages/SignUp";
import { AuthProvider } from "./provider/Authentication";
import MyRecipes from "./pages/MyRecipes";
import FavoriteRecipes from "./pages/FavoriteRecipes";

export const USER_UNKNOWN = "unknown";

function App() {
  return (
    <FirestoreProvider sdk={db}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<BrowseRecipes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/recipes" element={<Recipe />} />
            <Route path="/my_recipes" element={<MyRecipes />} />
            <Route path="/favorite_recipes" element={<FavoriteRecipes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </FirestoreProvider>
  );
}

export default App;
