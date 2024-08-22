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
        navigate(`/recipes?id=${id}`); //TODO: Replace navigate with <Link>-Component
      }}
    >
      <div className="recipeImageContainer">
        <img className="recipeImage" src={image} />
      </div>
      <div className="recipeNameContainer">
        <p className="recipeName">{name}</p>
      </div>
    </div>
  );
}
