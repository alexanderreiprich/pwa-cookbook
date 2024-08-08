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

import { RecipeInterface } from "./interfaces/RecipeInterface";
import { IngredientInterface } from "./interfaces/IngredientsInterface";
import RecipeElement from "./components/RecipeElement";
import "./style/RecipeElement.css";
import NavigationBar from "./components/NavigationBar";
// import "./style/NavigationBar.css";

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
    id: "strawberry_cake",
    name: "Strawberry Cake",
    ingredients: strawberryCakeIngredients,
    time: 140,
    image:
      "https://thescranline.com/wp-content/uploads/2023/06/STRAWBERRY-CAKE-S-01.jpg",
    steps: [
      "Choose Ingredients",
      "Mix Ingredients",
      "Put in oven for 300 degrees 161 mins",
    ],
  };

  const chocolateCakeIngredients: IngredientInterface[] = [
    {
      name: "Sugar",
      amount: 100,
      unit: "g",
    },
    {
      name: "Chocolate",
      amount: 500,
      unit: "g",
    },
    {
      name: "Milk",
      amount: 250,
      unit: "ml",
    },
  ];

  const chocolateCake: RecipeInterface = {
    id: "chocolate_cake",
    name: "Chocolate Cake",
    ingredients: chocolateCakeIngredients,
    time: 180,
    image:
      "https://hips.hearstapps.com/hmg-prod/images/chocolate-cake-index-64b83bce2df26.jpg",
    steps: [
      "Choose Ingredients",
      "Mix Ingredients",
      "Put in oven for 200 degrees 69 mins",
    ],
  };

  const createRecipe = async () => {
    await setDoc(doc(db, "recipes", chocolateCake.id), chocolateCake);
    await setDoc(doc(db, "recipes", strawberryCake.id), strawberryCake);
  };

  // createRecipe();

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
