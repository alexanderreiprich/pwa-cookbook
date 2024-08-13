import { doc} from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import { db } from "..";
import { useFirestoreDocData } from "reactfire";
import NavigationBar from "../components/NavigationBar";

function Recipe() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const ref = doc(db, "recipes", id!);
  const { status, data: recipe } = useFirestoreDocData(ref);

  if (status === "loading") {
    return <p>Rezept wird geladen...</p>
  }
  
  return (
    <div id="root">
      <NavigationBar title="Rezepte" />
      <div id="recipeHead">
        <p>{recipe.name}</p>
        <i>{recipe.description}</i>
      </div>
      <div id="recipeBody">
        <div id="recipeImgContainer">
          <img src={recipe.image} />
        </div>
        <div id="recipeIngredientContainer">

        </div>
        <div id="recipeStepsContainer">

        </div>
      </div>
    </div>
  );
}

export default Recipe