import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/home";
import "./App.css";

import {
  FirestoreProvider
} from "reactfire";

import "./style/RecipeElement.css";
import { db } from ".";
import BrowseRecipes from "./pages/BrowseRecipes";
import Recipe from "./pages/Recipe";

function App() {

  return (
    <FirestoreProvider sdk={db}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BrowseRecipes />} />
          <Route path="/recipes" element={<Recipe />} />
        </Routes>
      </BrowserRouter>
    </FirestoreProvider>
  );
}

export default App;
