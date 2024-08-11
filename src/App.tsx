import React from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Default from "./pages/default";
// import Home from "./pages/home";
import "./App.css";

import {
  doc,
  setDoc,
  getFirestore,
  collection,
  query,
  getDocs,
} from "firebase/firestore";
import {
  FirestoreProvider,
  useFirestore,
  useFirebaseApp,
  useFirestoreCollectionData,
  useFirestoreDocData,
} from "reactfire";

import RecipeElement from "./components/RecipeElement";
import "./style/RecipeElement.css";
import NavigationBar from "./components/NavigationBar";
import { db } from ".";

function GetRecipes() {
  const firestore = useFirestore();
  const recipesCollection = collection(firestore, "recipes");
  const recipesQuery = query(recipesCollection);
  const { status, data: recipes } = useFirestoreCollectionData(recipesQuery, {
    idField: "id",
  });

  if (status === "loading") {
    return <p>loading recipes...</p>;
  }
  console.log(recipes);
  return (
    <div id="root">
      <NavigationBar title="Titel" />
      <div className="recipeElementContainer">
        {recipes.map((recipe) => (
          <RecipeElement name={recipe.name} image={recipe.image} />
        ))}
      </div>
    </div>
  );
}

function App() {

  return (
    <FirestoreProvider sdk={db}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GetRecipes />} />
        </Routes>
      </BrowserRouter>
    </FirestoreProvider>
  );
}

export default App;
