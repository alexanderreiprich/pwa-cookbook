export default function RecipeElement({ name, image }: { name: string, image: string }) {
  return (
    <div className="recipeElement" onClick={() => {
      // TODO: Open recipe in detailed view
      }}>
      <img className="recipeImage" src={ image } />
      <p className="recipeName">{ name }</p>
    </div>
  );
}