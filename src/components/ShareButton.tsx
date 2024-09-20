import { Button } from "@mui/material";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { Share } from "@mui/icons-material";

export default function ShareButton({ recipe }: { recipe: RecipeInterface}) {
	async function share() {
		const shareData = {
			title: recipe.name,
			test: recipe.description,
			url: `https://alexanderreiprich.github.io/pwa-cookbook/recipes?id=${recipe.id}`
		}
		const resultP = document.getElementById('result') as HTMLElement;
		try{
			await navigator.share(shareData);
			resultP.textContent = "Rezept wurde geteilt.";
		}
		catch (error) {
			resultP.textContent = "Fehler beim Teilen. Bitte versuche es nochmal."
		}	
	}

	return(
		<div>
			<Button
				color="secondary"
				variant={"contained"}
				startIcon={<Share />}
				onClick={share} 
				style={{paddingLeft: '25px'}} />
				<i id='result' style={{paddingLeft: '10px'}}></i>
		</div>
	)
}