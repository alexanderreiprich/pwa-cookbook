// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-storage-compat.js')

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBKEtWnPeJ_oO1r0G5dvyZeAezZzd7T6Jo",
    authDomain: "pwacookbook.firebaseapp.com",
    projectId: "pwacookbook",
    storageBucket: "pwacookbook.appspot.com",
    messagingSenderId: "580668056456",
    appId: "1:580668056456:web:770d132b3cbf581fcc903d",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const storage = firebase.storage();

// IndexedDB setup
const dbName = 'recipes-db';
const storeName = 'recipes';
const userStoreName = 'user';
const imagesStoreName = 'images';

function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 3);
        request.onerror = (event) => reject(event);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(userStoreName)) {
                db.createObjectStore(userStoreName, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(imagesStoreName)) {
                db.createObjectStore(imagesStoreName, { keyPath: 'id' });
            }
        };
    });
}

async function getFromIndexedDB(id) {
    return openIndexedDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.get(id);
        request.onerror = (event) => reject(event);
        request.onsuccess = (event) => resolve(event.target.result);
    }));
}

async function getAllRecipesFromIndexedDB() {
    return openIndexedDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();
        request.onerror = (event) => reject(event);
        request.onsuccess = (event) => resolve(event.target.result);
    }));
}

async function getUserFromIDB() {
    return openIndexedDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction([userStoreName], 'readonly');
        const objectStore = transaction.objectStore(userStoreName);
        const request = objectStore.getAll();
        request.onerror = (event) => reject(event);
        request.onsuccess = (event) => resolve(event.target.result);
    }));
}

async function getImageFromIDB(id) {
    return openIndexedDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction([imagesStoreName], 'readonly');
        const objectStore = transaction.objectStore(imagesStoreName);
        const request = objectStore.get(id);
        request.onerror = (event) => reject(event);
        request.onsuccess = (event) => resolve(event.target.result);
    }));
}

async function getUserFromFirestore(email) {
    const querySnapshot = await firestore.collection('users').where('email', '==', email).get();
    return querySnapshot.docs.length ? querySnapshot.docs[0].data() : null;
}

async function getFavoritesIdsFromFirestore() {
    const user = await getUserFromIDB();
    if (user && user[0].email) {
        const fireStoreUser = await getUserFromFirestore(user[0].email);
        let ids = { favorites: [], date_edit: null};
        if(fireStoreUser && fireStoreUser.favorites) {
            ids.favorites = fireStoreUser.favorites
        }
        if(fireStoreUser && fireStoreUser.date_edit) {
            ids.date_edit = fireStoreUser.date_edit
        }
        return ids;
    }
    return [];
}

function getFromFirestore(id) {
    return firestore.collection('recipes').doc(id).get().then(doc => doc.exists ? doc.data() : null);
}

function addToIndexedDB(doc) {
    return openIndexedDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.add(doc);
        request.onerror = (event) => {
            if (event.target.error.name === 'ConstraintError') {
                console.error('Document with this ID already exists in IndexedDB');
            }
            reject(event);
        };
        request.onsuccess = () => resolve();
    }));
}

function putToIndexedDB(doc) {
    return openIndexedDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.put(doc);
        request.onerror = (event) => reject(event);
        request.onsuccess = () => resolve();
    }));
}

async function addFavoritesListToIndexedDB(favorites, date_edit) {
    return openIndexedDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction([userStoreName], 'readwrite');
        const objectStore = transaction.objectStore(userStoreName);
        const favoritesEntry = { id: "userFavorites", favorites: favorites, date_edit: date_edit };
        const request = objectStore.put(favoritesEntry);
        request.onerror = (event) => reject(event);
        request.onsuccess = (event) => resolve();
    }));
}

function addToFirestore(doc) {
    if(doc && doc.public) return firestore.collection('recipes').doc(doc.id).set(doc);
    else return null;
}

async function addFavoritesListToFirestore(email, favorites) {
    const userDoc = firestore.collection('users').doc(email);
    const userSnapshot = await userDoc.get();
    if (userSnapshot.exists) {
        return userDoc.update({ favorites });
    } else {
        return userDoc.set({ email, favorites });
    }
}

async function syncDBs() {
    await syncFavoritesFromFirestore();
    await syncOwnRecipesFromFirestore();
    await syncRecipeImages();
    console.log("Service worker synced DBs");
}

async function syncOwnRecipesFromFirestore() {
    const user = await getUserFromIDB();
    if (user && user[0].email) {
        const querySnapshot = await firestore.collection('recipes').where('author', '==', user[0].email).get();
        const recipes = querySnapshot.docs.map(doc => doc.data());
        return Promise.all(recipes.map(syncFirestoreDocToIndexedDB));
    }
}

async function syncRecipeImages() {
    const recipes = await getAllRecipesFromIndexedDB();
    return Promise.all(recipes.map((recipe) => {
        if (recipe.public) {
            syncImages(recipe.id)
        }
    }));
}

async function syncFileInDBs(firestoreDoc, idbDoc) {
    if (firestoreDoc && firestoreDoc.date_edit) {
        if (idbDoc.date_edit && idbDoc.date_edit.seconds && firestoreDoc.date_edit.seconds && idbDoc.date_edit.seconds > firestoreDoc.date_edit.seconds) {
            await addToFirestore(idbDoc);
            return putToIndexedDB(idbDoc);
        }
        else if(!idbDoc.date_edit || !idbDoc.date_edit.seconds) {
            await putToIndexedDB(firestoreDoc);
            return addToFirestore(firestoreDoc);
        }
        else if(!firestoreDoc.date_edit.seconds){
            return addToFirestore(idbDoc);
        }
    } else {
        return addToFirestore(idbDoc);
    }
}

function syncFirestoreDocToIndexedDB(doc) {
    if (doc && doc.id) {
        return getFromIndexedDB(doc.id).then(idbDoc => {
            if (!idbDoc) {
                return addToIndexedDB(doc);
            } else {
                syncFileInDBs(doc, idbDoc);
            }
        });
    }
}

async function syncFavoritesFromFirestore() {
    const ids = await getFavoritesIdsFromFirestore();
    if(ids && Array.isArray(ids.favorites)) {
        if(ids.favorites) await Promise.all(ids?.favorites.map(id => getFromFirestore(id).then(syncFirestoreDocToIndexedDB)));
        return syncFavoritesList(ids);
    } else return syncFavoritesList([]);
}

async function syncFavoritesList(ids) {
    console.log(ids);
    const idbUser = await getUserFromIDB();
    let newFavorites = [];
    let newEditDate = {};
    let firestoreFavorites = ids.favorites ? [...ids.favorites] : [];
    let firestoreEditDate = ids.date_edit ? ids.date_edit : {};
    let useFirestore = true;
    let idbFavorites = idbUser ? (idbUser[0].favorites ? idbUser[0].favorites : (idbUser[1].favorites ? idbUser[1].favorites : [])) : [];
    let idbEditDate = idbUser ? (idbUser[0].date_edit ? idbUser[0].date_edit : (idbUser[1].date_edit ? idbUser[1].date_edit : {})) : {};
    if (idbUser) {
        console.log("syncFavoritesList", "idb", idbFavorites, idbEditDate, "firestore", firestoreFavorites, firestoreEditDate)
        if (arraysEqual(idbFavorites, newFavorites) && newFavorites.length > 0) return;
        else if (idbEditDate && firestoreEditDate) {
            if (!compareTimestamps(firestoreEditDate, idbEditDate)) {
                console.log("!compareTimestamps(firestoreEditDate, idbEditDate)");
                newFavorites = idbFavorites;
                newEditDate = idbEditDate;
                useFirestore = false;
            }
        }  else if (idbEditDate) {
            console.log("idbEditDate");
            newFavorites = idbFavorites;
            newEditDate = idbEditDate;
            useFirestore = false;
        }
    }
    if (useFirestore) {
        console.log("useFirestore");
        newFavorites = firestoreFavorites;
        newEditDate = firestoreEditDate;
    }
    if (!idbUser[1] || !idbUser[1].favorites || (idbUser[1].favorites.length < 1 && newFavorites.length > 0) || !arraysEqual(idbUser[1].favorites, newFavorites)) {
        await addFavoritesListToIndexedDB(newFavorites, newEditDate);
    }
    if (idbUser[0] && idbUser[0].email && !arraysEqual(ids, newFavorites)) {
        await addFavoritesListToFirestore(idbUser[0].email, newFavorites, newEditDate);
    }
}

async function syncImages(id) {
    const indexedDBImage = await getImageFromIDB(id);
    const storageRef = storage.ref(`recipes/${id}.jpg`);
    let storageLastEdit = null;
    firebase.getMetadata(storageRef).then((metadata) => {
        metadata.updated ? storageLastEdit = firebase.Timestamp(new Date(metadata.updated)) : null;
    });
    if (!storageLastEdit || indexedDBImage.last_edit > storageLastEdit) {
        await firestore.uploadBytes(storageRef, indexedDBImage.image);
        console.log("Image updated.")
    }
    else {
        const transaction = db.transaction('images', 'readwrite');
        const objectStore = transaction.objectStore('images');
        let imgRecord = convertImageToBlob(id);
        await objectStore.put(imgRecord);      
    }
}

// Boiler plate comparison function
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    
    // Sort both arrays
    let sortedArr1 = [...arr1].sort();
    let sortedArr2 = [...arr2].sort();
  
    // Compare sorted arrays
    for (let i = 0; i < sortedArr1.length; i++) {
      if (sortedArr1[i] !== sortedArr2[i]) {
        return false;
      }
    }
    return true;
}

function convertImageToBlob(id) {
    const storageRef = firebase.storage.ref(`images/${id}.jpg`);
    return storageRef.getDownloadURL().then((url) => {
        return fetch(url).then(response => response.blob()).then(blob => {return { id: id, image: blob, date_edit: firebase.Timestamp.now() }});
    });
}

async function handleNetworkStatusChange(isOnline) {
    if (isOnline) {
        console.log('Network is online');
        await syncDBs();
    } else {
        console.log('Network is offline');
    }
}

function compareTimestamps(a, b) {
    if(!a.seconds || !b.seconds) return false;
    if (a.seconds < b.seconds) {
        return false;
    } else if (a.seconds > b.seconds) {
        return true;
    } else {
        if (a.nanoseconds < b.nanoseconds) {
            return false;
        } else if (a.nanoseconds > b.nanoseconds) {
            return true;
        } else {
            return false;
        }
    }
}

// Service Worker events
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Activation event', event);
    event.waitUntil(syncDBs());
});

self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'NETWORK_STATUS_CHANGE') {
      event.waitUntil(handleNetworkStatusChange(event.data.isOnline));
    }
});
