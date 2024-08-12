import React from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import {
  collection,
  query
} from "firebase/firestore";
import {
  FirestoreProvider,
  useFirestore,
  useFirestoreCollectionData,
} from "reactfire";

import RecipeElement from "./components/RecipeElement";
import "./style/RecipeElement.css";
import NavigationBar from "./components/NavigationBar";
import { db } from ".";
import Home from "./pages/home";
import Search from "./pages/search";
import RecipeOverview from "./pages/recipeOverview";

// function GetRecipes() {
//   const firestore = useFirestore();
//   const recipesCollection = collection(firestore, "recipes");
//   const recipesQuery = query(recipesCollection);
//   const { status, data: recipes } = useFirestoreCollectionData(recipesQuery, {
//     idField: "id",
//   });

//   if (status === "loading") {
//     return <p>loading recipes...</p>;
//   }
//   console.log(recipes);
//   return (
//     <div>
//       <NavigationBar title="PWA Cookbook" />
//       <div className="recipeElementContainer">
//         {recipes.map((recipe) => (
//           <RecipeElement name={recipe.name} image={recipe.image} />
//         ))}
//       </div>
//     </div>
//   );
// }

function App() {

  return (
    <FirestoreProvider sdk={db}>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<GetRecipes />} /> */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/recipe-overview" element={<RecipeOverview />} />
        </Routes>
      </BrowserRouter>
    </FirestoreProvider>
  );
}

export default App;
