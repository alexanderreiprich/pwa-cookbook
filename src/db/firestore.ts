import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "..";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { TAG } from "../interfaces/TagEnum";
import { saveRecipe } from "../helpers/synchDBHelper";
import { User } from "firebase/auth";
import { FilterInterface } from "../interfaces/FilterInterface";
import { LikesInterface } from "../interfaces/LikesInterface";

export async function fetchFromFirestore(q: any): Promise<RecipeInterface[]> {
    try{
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data() as Partial<RecipeInterface>; // Type Assertion
        
            return {
            ...data
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
      await updateDoc(recipeRef, { favorites: newFavorites, date_edit: Timestamp.now() });
      console.log('Favoriten erfolgreich in Firestore aktualisiert.');
    } catch (err) {
        console.log(err);
    }

    updateFavoritesListInFirestore(user, id, likes);
  }


  async function updateFavoritesListInFirestore(user: User | null, id: string, likes: boolean): Promise<void> {
    try {
      const userId: string = await getUserId(user);
      const userRef = doc(db, 'users', userId);
      if (likes) {
        await updateDoc(userRef, { favorites: arrayUnion(id), edit_date: Timestamp.now() });
      } else {
        await updateDoc(userRef, { favorites: arrayRemove(id), edit_date: Timestamp.now() });
      }
      console.log('Benutzerfavoriten erfolgreich in Firestore aktualisiert.');
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Benutzerfavoriten in Firestore:', error);
    }
  }

export async function updateRecipeInFirestore(id: string, updatedRecipe: Partial<RecipeInterface>): Promise<void> {
    try {
      const recipeRef = doc(db, 'recipes', id);
      // updates recipe in firestore
      await setDoc(recipeRef, saveRecipe(updatedRecipe), { merge: true });
      console.log('Rezept erfolgreich in Firestore aktualisiert.');
    } catch (e) {
        console.log(e);
    }

}

export async function getAllRecipesFromFirestore(filters: FilterInterface): Promise<RecipeInterface[]> {
    let recipes: RecipeInterface[] = [];
    try {
      let q: any = collection(db, 'recipes');
      if (filters.timeMin) {
        console.log("timemin")
        q = query(q, where('time', '>=', Number(filters.timeMin)));
      }
      if (filters.timeMax) {
        console.log("timemax")
        q = query(q, where('time', '<=', Number(filters.timeMax)));
      }
      if (filters.tags && filters.tags.length > 0) {
        let chosenTags: string[] = [];
        filters.tags.map((tag) => chosenTags.push(TAG[tag].toString()));
        console.log("tags", chosenTags)
        q = query(q, where('tags', 'array-contains-any', chosenTags));
      }
      if (filters.difficulty) {
        q = query(q, where('difficulty', '==', DIFFICULTY[filters.difficulty]));
      }
      console.log(q);
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
          ...data
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

export async function createRecipeInFirestore(newRecipe: RecipeInterface): Promise<void> {
  try {
    const recipeRef = doc(db, 'recipes', newRecipe.id);

    await setDoc(recipeRef, saveRecipe(newRecipe));
    console.log('Rezept erfolgreich in Firestore erstellt.');

  } catch (err) {
      console.log(err);
  }
}

export async function deleteRecipeInFirestore(id: string, user: User | null): Promise<void> {
  try {
    const recipeRef = doc(db, 'recipes', id);
    const isLiked = await checkRecipeLikesInFirestore(id, user);
    if(isLiked) {
      updateFavoritesListInFirestore(user, id, false);
    }
    await deleteDoc(recipeRef).then( () =>
    console.log('Rezept erfolgreich aus Firestore gelöscht.'));

  } catch (err) {
      console.log(err);
  }
}

export async function checkRecipeLikesInFirestore(id: string, currentUser: User | null): Promise<LikesInterface> {
  let likes: LikesInterface = { likes: false, numberOfLikes: 0 };
  try {
    const userId: string = await getUserId(currentUser);
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      const favorites: Array<string> = data.favorites;
      const recipe = await getRecipeByIdFromFirestore(id);
      const numberOfLikes = recipe && recipe.favorites ? recipe.favorites : 0;
      likes = { likes: favorites.includes(id), numberOfLikes: numberOfLikes };
    }
    return likes;
  } catch (error) {
    console.error('Fehler beim Abrufen von Firestore-Daten:', error);
    return likes;
  }
}

export async function changeRecipeVisibilityInFirestore(recipe: Partial<RecipeInterface>, visibility: boolean): Promise<void> {
  try {
    if(recipe.id){
      if(visibility){
        const recipeRef = { ...recipe,  public: visibility, date_edit: Timestamp.now()}
        await updateRecipeInFirestore(recipe.id, recipeRef);
      } else {
        const recipeRef = doc(db, 'recipes', recipe.id);
        // Not deleteRecipeFromFirestore to keep Favorites
        await deleteDoc(recipeRef).then( () =>
        console.log('Rezept erfolgreich aus Firestore gelöscht.'));
    
      }
    }
  } catch (error) {
    console.error("Fehler beim Zugriff auf Rezept:", error);
    return;
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

export async function getUsersRecipesInFirestore(currentUser: User | null): Promise<RecipeInterface[]> {
  let recipes: RecipeInterface[] = [];
  let user = currentUser ? (currentUser.displayName ? currentUser.displayName : currentUser.email) : "unknown";
  try {
    let q: any = collection(db, 'recipes');
    q = query(q, where('author', "==", user));
    recipes = await fetchFromFirestore(q);
  } catch (error) {
    console.error('Fehler beim Abrufen von Firestore:', error);
    return [];
  }
  return recipes;
}

export async function getUsersSavedRecipesInFirestore(currentUser: User | null): Promise<RecipeInterface[]> {
  let recipes: RecipeInterface[] = [];
  let user = currentUser ? (currentUser.displayName ? currentUser.displayName : currentUser.email) : "unknown";

  try {
    let s: any = collection(db, "users");
    s = query(s, where("email", "==", user));
    const username = await getDocs(s);
    let savedRecipeList: string[] = [];
    username.docs.map((user) => (savedRecipeList = user.get("favorites")));

    let q: any = collection(db, 'recipes');
    q = query(q, where('id', "in", savedRecipeList));
    recipes = await fetchFromFirestore(q);
  } catch (error) {
    console.error('Fehler beim Abrufen von Firestore:', error);
    return [];
  }
  return recipes;
}