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
import NavigationBar from "./components/NavigationBar";
import { db } from ".";
import BrowseRecipes from "./pages/BrowseRecipes";
import Recipe from "./pages/Recipe";
import { RecipeInterface } from "./interfaces/RecipeInterface";
import { DIFFICULTY } from "./interfaces/DifficultyEnum";
import { addDoc, collection } from "firebase/firestore";

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
