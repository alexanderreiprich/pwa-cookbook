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

import "../style/RecipeElement.css";
import NavigationBar from "../components/NavigationBar";
import RecipeElement from "../components/RecipeElement";
import { db } from "..";

 function RecipeOverview() {
  const firestore = useFirestore();
  const recipesCollection = collection(firestore, "recipes");
  const recipesQuery = query(recipesCollection);
  const { status, data: recipes } = useFirestoreCollectionData(recipesQuery, {
    idField: "id",
  });

  if (status === "loading") {
    return (<div>
      <NavigationBar title="PWA Cookbook" />
      <div className="recipeElementContainer">
        Laden....
      </div>
    </div>)
  }
  console.log(recipes);
  return (
    <div>
      <NavigationBar title="PWA Cookbook" />
      <div className="recipeElementContainer">
        {recipes.map((recipe) => (
          <RecipeElement name={recipe.name} image={recipe.image} />
        ))}
      </div>
    </div>
  );
}

export default RecipeOverview;
