import React from "react";
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
  orderBy,
} from "firebase/firestore";
import {
  FirestoreProvider,
  useFirestore,
  useFirebaseApp,
  useFirestoreCollectionData,
} from "reactfire";

import { RecipeInterface } from "./interfaces/RecipeInterface";
import { IngredientInterface } from "./interfaces/IngredientsInterface";
import { Button } from "@mui/material";
import ButtonUsage from "./components/Button";

// Test function, TODO: remove
// function GetDoc() {
//   const ref = doc(useFirestore(), "testing", "firsttest");
//   const { status, data } = useFirestoreDocData(ref);
//   if (status === "loading") {
//     return <p>beep boop loading</p>;
//   }
//   return <p>yoo, it's {data.test ? "true" : "false"}</p>;
// }

function GetRecipes() {
  const firestore = useFirestore();
  const recipeCollection = collection(firestore, "recipies");
  const dessertQuery = query(recipeCollection);
  const { status, data: recipies } = useFirestoreCollectionData(dessertQuery, {
    idField: "id",
  });

  if (status === "loading") {
    return <p>loading recipies...</p>;
  }
  return <div>
    <Button>Test</Button>
      <ButtonUsage></ButtonUsage>
    <ul>
      {recipies.map((recipe) => (
        <li key={recipe.id}>
          omg {recipe.name} consists of
          <ul>
            {recipe.ingredients.map(
              (ingred: IngredientInterface, index: number) => (
                <li key={index}>{ingred.name}</li>
              )
            )}
          </ul>
          and has to bake for {recipe.time} min!
        </li>
      ))}
    </ul>
</div>
}

function App() {
  const db = getFirestore(useFirebaseApp());

  const strawberryCakeIngredients: IngredientInterface[] = [
    {
      name: "Sugar",
      amount: 100,
      unit: "g",
    },
    {
      name: "Strawberries",
      amount: 500,
      unit: "g",
    },
    {
      name: "Milk",
      amount: 250,
      unit: "ml",
    },
  ];

  const strawberryCake: RecipeInterface = {
    name: "Strawberry Cake",
    ingredients: strawberryCakeIngredients,
    time: 140,
  };

  const createRecipe = async () => {
    await setDoc(doc(db, "recipies", "desserts"), { strawberryCake });
  };

  // createRecipe();

  return (
    <FirestoreProvider sdk={db}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Default />} />
          <Route index element={<GetRecipes />} />
        </Routes>
      </BrowserRouter>
    </FirestoreProvider>
  );
}

export default App;
