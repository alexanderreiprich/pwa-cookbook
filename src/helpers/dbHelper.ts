import { Button } from "@mui/material";
import { addDoc, collection, deleteDoc, doc, DocumentData, getDocFromServer, setDoc } from "firebase/firestore";
import { db } from "..";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { IngredientInterface } from "../interfaces/IngredientsInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { TAG } from "../interfaces/TagEnum";
import { update } from "firebase/database";

export async function createRecipe(recipe: RecipeInterface) {
    try {
        const docRef = await addDoc(collection(db, "recipes"), recipe);
        alert("Rezept hinzugefügt")
    }
    catch (e) {
        alert("Fehler beim Hinzufügen");
    }
}

export async function editRecipe(id: String, recipe: RecipeInterface) {
    try {
        const path = "recipes/" + id;
        const docRef = doc(db, path);
        await setDoc(docRef, recipe as DocumentData);
        alert("Rezept gespeichert")
    }
    catch (e) {
        console.log(e);
        alert("Fehler beim Hinzufügen");
    }
}

// Todo: Test functionality after recipes can be created
export async function deleteRecipe(id: String) {
    try {
        // if(confirm("Soll das Rezept wirklich gelöscht werden?")){
        const path = "recipes/" + "id";
        const docRef = doc(db, path);
        await deleteDoc(docRef);
        alert("Rezept " + id + " gelöscht")
        // }
    }
    catch (e) {
        console.log(e);
        alert("Fehler beim Löschen");
    }
}