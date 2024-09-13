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
import Login from "./pages/Login";
import Register from "./pages/SignUp";
import { AuthProvider } from "./provider/Authentication";
import PrivateRoute from "./components/PrivateRoute";
import MyRecipes from "./pages/MyRecipes";
import { useNetworkStatus } from "./provider/NetworkStatusProvider";
import FavoriteRecipes from "./pages/FavoriteRecipes";

function App() {

  const { isOnline } = useNetworkStatus();
  return (
    <FirestoreProvider sdk={db}>
      <BrowserRouter>
        <AuthProvider>

        <Routes>
              {isOnline === true ? (<Route path="/" element={<PrivateRoute><BrowseRecipes /></PrivateRoute>} />) : (<Route path="/" element={<BrowseRecipes />} />)}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              {isOnline === true ? (<Route path="/recipes" element={<PrivateRoute><Recipe /></PrivateRoute>} />) : (<Route path="/recipes" element={<Recipe />} />)}
              {isOnline === true ? (<Route path="/my_recipes" element={<PrivateRoute><MyRecipes /></PrivateRoute>} />) : (<Route path="/my_recipes" element={<MyRecipes />} />)}
              {isOnline === true ? (<Route path="/favorite_recipes" element={<PrivateRoute><FavoriteRecipes /></PrivateRoute>} />) : (<Route path="/favorite_recipes" element={<FavoriteRecipes />} />)}
            </Routes>
        </AuthProvider>
      </BrowserRouter>
    </FirestoreProvider>
  );
}

export default App;
