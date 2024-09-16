import { useNavigate } from "react-router-dom";

export default function RecipeElement({
  name,
  image,
  id,
}: {
  name: string;
  image: string;
  id: string;
}) {
  let navigate = useNavigate();
  return (
    <div
      className="recipeElement"
      onClick={() => {
        navigate(`/recipes?id=${id}`);
      }}
    >
      <div className="recipeImageContainer">
        <img className="recipeImage" src={image ? image : "../public/default.jpg"} />
      </div>
      <div className="recipeNameContainer">
        <p className="recipeName">{name}</p>
      </div>
    </div>
  );
}
