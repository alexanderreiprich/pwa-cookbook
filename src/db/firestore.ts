import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "..";
import { RecipeInterface } from "../interfaces/RecipeInterface";
import { DIFFICULTY } from "../interfaces/DifficultyEnum";
import { TAG } from "../interfaces/TagEnum";
import { base64ToFile, saveRecipe } from "../helper/helperFunctions";
import { User } from "firebase/auth";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { FilterInterface } from "../interfaces/FilterInterface";
import { LikesInterface } from "../interfaces/LikesInterface";
import { getImageBase64, getRecipeByIdFromIndexedDB } from "./idb";
import { USER_UNKNOWN } from "../App";

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
        await updateDoc(userRef, { favorites: arrayUnion(id), date_edit: Timestamp.now() });
      } else {
        await updateDoc(userRef, { favorites: arrayRemove(id), date_edit: Timestamp.now() });
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

export async function getAllRecipesFromFirestore(filters: FilterInterface): Promise<RecipeInterface[]> {
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
        let chosenTags: string[] = [];
        filters.tags.map((tag) => chosenTags.push(TAG[tag].toString()));
        q = query(q, where('tags', 'array-contains-any', chosenTags));
      }
      if (filters.difficulty) {
        q = query(q, where('difficulty', '==', DIFFICULTY[filters.difficulty]));
      }
      recipes = await fetchFromFirestore(q);
    } catch (error) {
      console.error('Fehler beim Abrufen von Firestore:', error);
      return [];
    }
    return recipes;
  }


  export async function getRecipeByIdFromFirestore(id: string): Promise<RecipeInterface | null> {
    console.log("getRecipeByIdFromFirestore", id)
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

export async function createRecipeInFirestore(newRecipe: RecipeInterface, image?: File): Promise<void> {
  try {
    const recipeRef = doc(db, 'recipes', newRecipe.id);
    if (image) {
      let imgLink = await uploadImage(newRecipe.id, image);
      newRecipe.image = imgLink;
    }
    else {
      const storage = getStorage();
      newRecipe.image = await getDownloadURL(ref(storage, 'recipes/undefined.jpg'))
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
    deleteRecipeFromAllFavoritesListsInFireStore(id);
    await deleteDoc(recipeRef).then( () =>
    console.log('Rezept erfolgreich aus Firestore gelöscht.'));
    const storage = getStorage();
    let imageRef = ref(storage, `recipes/${id}.jpg`);
    deleteObject(imageRef).then(() => {
      console.log("Rezeptbild erfolgreich aus Firebase Storage gelöscht.")
    }).catch((error) => {
      console.log(error)
    });
    
  } catch (err) {
      console.log(err);
  }
}

export async function checkRecipeLikesInFirestore(id: string, currentUser: User | null): Promise<LikesInterface | null> {
  try {
    const userId: string = await getUserId(currentUser);
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      const favorites: Array<string> = data.favorites;
      const recipe = await getRecipeByIdFromFirestore(id);
      const numberOfLikes = recipe?.favorites;
      if(numberOfLikes) return { likes: favorites.includes(id), numberOfLikes: numberOfLikes };
    }
    return null;
  } catch (error) {
    console.error('Fehler beim Abrufen von Firestore-Daten:', error);
    return null;
  }
}

export async function changeRecipeVisibilityInFirestore(id: string, visibility: boolean, user: User | null, isLiked: boolean): Promise<void> {
  try {
    if(id){
      if(visibility){
        const recipe = await getRecipeByIdFromIndexedDB(id)
        const imgBase64 = await getImageBase64(id);
        const storage = getStorage();
        let url: string = await getDownloadURL(ref(storage, 'recipes/undefined.jpg'));      
        if (imgBase64) {
          const img = base64ToFile(imgBase64, id);
          url = await uploadImage(id, img);
        }
        console.log(imgBase64, url);
        const updatedRecipe: Partial<RecipeInterface> = { ...recipe, image: url, public: visibility, date_edit: Timestamp.now() };
        // update userFavorites
        if(isLiked) {
          updateFavoritesListInFirestore(user, id, true);
        }
        if(recipe) await updateRecipeInFirestore(id, updatedRecipe);
      } else {
        if(user?.email) {
          const recipeRef = doc(db, 'recipes', id);
          deleteRecipeFromAllFavoritesListsInFireStore(id, user?.email);
          await deleteDoc(recipeRef);
          const storage = getStorage();
          let imageRef = ref(storage, `recipes/${id}.jpg`);
          deleteObject(imageRef).then(() => {
            console.log("Rezeptbild erfolgreich aus Firebase Storage gelöscht.")
          }).catch((error) => {
            console.log(error)
          });
        } else deleteRecipeInFirestore(id);
      }
    }
  } catch (error) {
    console.error("Fehler beim Zugriff auf Rezept:", error);
    return;
  }
}

async function getUserId(currentUser: User | null): Promise<string> {
  let userId: string = USER_UNKNOWN;
  if (currentUser && currentUser.displayName) {
    let user = await getDoc(doc(db, 'users', currentUser.displayName));
    userId = user.id;
  }
  else if(currentUser && currentUser.email){
    let email: string = currentUser.email;
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Under the assumption that the email is a unique property
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

export async function getUsersRecipesInFirestore(currentUser: User | null): Promise<RecipeInterface[]> {
  let recipes: RecipeInterface[] = [];
  let user = currentUser ? (currentUser.displayName ? currentUser.displayName : currentUser.email) : USER_UNKNOWN;
  try {
    let q: any = collection(db, 'recipes');
    q = query(q, where('author', "==", user)); //TODO: email und nutzername checken
    if (currentUser) {
      if (user == currentUser.displayName) {
        q = query(q, where('author', '==', currentUser.email));
      }
      else {
        q = query(q, where('author', '==', currentUser.displayName));
      }
    }
    recipes = await fetchFromFirestore(q);
  } catch (error) {
    console.error('Fehler beim Abrufen von Firestore:', error);
    return [];
  }
  return recipes;
}

export async function getUsersFavoriteRecipesInFirestore(currentUser: User | null): Promise<RecipeInterface[]> {
  let recipes: RecipeInterface[] = [];
  let user = currentUser ? (currentUser.displayName ? currentUser.displayName : currentUser.email) : USER_UNKNOWN;
  try {
    let s: any = collection(db, "users");
    let savedRecipeList: string[] = [];
    if (user && user == currentUser?.displayName) {
      let username = await getDoc(doc(db, 'users', user));
      let docData = username.data() as any;
      savedRecipeList = docData.favorites;
    }
    else {
      s = query(s, where("email", "==", user));
      let username = await getDocs(s);
      username.docs.map((user) => (savedRecipeList = user.get("favorites")));
    }

    let q: any = collection(db, 'recipes');
    q = query(q, where('id', "in", savedRecipeList));
    recipes = await fetchFromFirestore(q);
  } catch (error) {
    console.error('Fehler beim Abrufen von Firestore:', error);
  }
  return recipes;
}

export async function deleteRecipeFromAllFavoritesListsInFireStore (id: string, exemptUserEmail?: string) {
  try {
    // Get all users
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    // Iterate through all users
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();

      // Check whether favoritesList contains id
      if (userData.favorites && Array.isArray(userData.favorites) && userData.email != exemptUserEmail) {
        const updatedFavorites = userData.favorites.filter((favoriteId: string) => favoriteId !== id);
        // if filtering was effective: update list with new date_edit
        if (updatedFavorites.length !== userData.favorites.length) {
          await updateDoc(doc(db, 'users', userDoc.id), {
            favorites: updatedFavorites,
            date_edit: Timestamp.now()
          });
        }
      }
    }
  } catch (error) {
    console.error('Fehler beim Entfernen des Rezepts aus den Favoritenlisten:', error);
  }
}

async function fetchDownloadURL(id: string) {
  console.log(id);
  const storage = getStorage();
  const storageRef = ref(storage, `recipes/${id}.jpg`);
  return await getDownloadURL(storageRef);
}
navigator.serviceWorker.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'FETCH_DOWNLOAD_URL') {
    const imagePath = event.data.imagePath;
    console.log(imagePath);
    fetchDownloadURL(imagePath).then((url) => {
      event.source?.postMessage({
        type: 'DOWNLOAD_URL_RESULT',
        id: imagePath,
        url: url
      });
    }).catch((error) => {
      console.error('Download URL konnte nicht gefetched werden: ', error);
      event.source?.postMessage({
        type: 'DOWNLOAD_URL_ERROR',
        id: imagePath,
        error: error.message
      });
    });
  }
})