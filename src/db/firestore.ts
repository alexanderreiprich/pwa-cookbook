import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "..";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { TAG } from "../interfaces/TagEnum";
import { parseDate, saveRecipe } from "../helpers/synchDBHelper";
import { User } from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";

export async function fetchFromFirestore(q: any): Promise<RecipeInterface[]> {
    try{
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data() as Partial<RecipeInterface>; // Type Assertion
        
            // Convert Timestamp to Date
            const date_create = parseDate(data.date_create);
        
            return {
            id: doc.id,
            ...data,
            date_create,
            } as RecipeInterface;
        });
    } catch (error) {
        console.log(error);
        return [];
    }
}


export async function updateRecipeFavoritesInFirestore(user: User | null, id: string, newFavorites: number, likes: boolean): Promise<void> {
    try {
      const recipeRef = doc(db, 'recipes', id);
      await updateDoc(recipeRef, { favorites: newFavorites });
      console.log('Favoriten erfolgreich in Firestore aktualisiert.');
    } catch (err) {
        console.log(err);
    }

    try {
      const userId: string = await getUserId(user);
      const userRef = doc(db, 'users', userId);
      if (likes) {
        await updateDoc(userRef, { favorites: arrayUnion(id) });
      } else {
        await updateDoc(userRef, { favorites: arrayRemove(id) });
      }
      console.log('Benutzerfavoriten erfolgreich in Firestore aktualisiert.');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Benutzerfavoriten in Firestore:', error);
    }
  }

export async function updateRecipeInFirestore(id: string, updatedRecipe: Partial<RecipeInterface>, image?: File): Promise<void> {
    try {
      const recipeRef = doc(db, 'recipes', id);
      if (image) {
        let imgLink = await uploadImage(updatedRecipe.id!, image);
        updatedRecipe.image = imgLink;
      }
      await setDoc(recipeRef, saveRecipe(updatedRecipe), { merge: true });
      console.log('Rezept erfolgreich in Firestore aktualisiert.');
    } catch (e) {
        console.log(e);
    }

}

export async function getAllRecipesFromFirestore(filters: any): Promise<RecipeInterface[]> {
    let recipes: RecipeInterface[] = [];
    try {
      let q: any = collection(db, 'recipes');
  
      if (filters.timeMin) {
        q = query(q, where('time', '>=', Number(filters.timeMin)));
      }
      if (filters.timeMax) {
        q = query(q, where('time', '<=', Number(filters.timeMax)));
      }
      if (filters.tags && filters.tags.length > 0) {
        let chosenTags = filters.tags.map((tag: string) => TAG[tag as keyof typeof TAG]);
        q = query(q, where('tags', 'array-contains-any', chosenTags));
      }
      if (filters.difficulty && filters.difficulty.length > 0) {
        q = query(q, where('difficulty', '==', DIFFICULTY[filters.difficulty as keyof typeof DIFFICULTY]));
      }
  
      recipes = await fetchFromFirestore(q);
    } catch (error) {
      console.error('Fehler beim Abrufen von Firestore:', error);
      return [];
    }
    return recipes;
  }


  export async function getRecipeByIdFromFirestore(id: string): Promise<RecipeInterface | null> {
    try {
      const recipeRef = doc(db, 'recipes', id);
      const docSnap = await getDoc(recipeRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<RecipeInterface>;
  
        return {
          ...data,
          id: docSnap.id,
          date_create: parseDate(data.date_create),
        } as RecipeInterface;
      } else {
        console.log('Rezept nicht in Firestore gefunden. Versuche, es aus IndexedDB abzurufen.');
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen von Firestore-Daten:', error);
      console.log('Versuche, das Rezept aus IndexedDB abzurufen.');
      return null;
    }
  }

export async function createRecipeInFirestore(newRecipe: RecipeInterface, image?: File): Promise<void> {
  try {
    const recipeRef = doc(db, 'recipes', newRecipe.id);
    if (image) {
      let imgLink = await uploadImage(newRecipe.id, image);
      newRecipe.image = imgLink;
    }
    await setDoc(recipeRef, saveRecipe(newRecipe));
    console.log('Rezept erfolgreich in Firestore erstellt.');

  } catch (err) {
      console.log(err);
  }
}

export async function deleteRecipeInFirestore(id: string): Promise<void> {
  try {
    const recipeRef = doc(db, 'recipes', id);

    await deleteDoc(recipeRef);
    console.log('Rezept erfolgreich aus Firestore gelöscht.');

  } catch (err) {
      console.log(err);
  }
}

export async function checkRecipeLikesInFirestore(id: string, currentUser: User | null): Promise<boolean> {
  try {
    let userId: string = await getUserId(currentUser);
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      let favorites: Array<string> = data.favorites;
      return(favorites.includes(id));
    } else {
      return false;
    }
  } catch (error) {
    console.error('Fehler beim Abrufen von Firestore-Daten:', error);
    return false;
  }
}

async function getUserId(currentUser: User | null): Promise<string> {
  let userId: string = "superuser";
    if(currentUser && currentUser.email){
      let email: string = currentUser.email;
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Under the assumption that the email ist a unique property
        userId = querySnapshot.docs[0].id;
      }
    }
    return userId;
}

async function uploadImage(id: string, image: File): Promise<string> {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `recipes/${id}.jpg`);
    const uploadResult = await uploadBytes(storageRef, image);
    return getDownloadURL(uploadResult.ref);
  }
  catch (error) {
    return "Error - " + error;
  }

}