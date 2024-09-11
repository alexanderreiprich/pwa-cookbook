// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js');

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

// IndexedDB setup
const dbName = 'recipes-db';
const storeName = 'recipes';
const userStoreName = 'user';

function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 2);
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
        };
    });
}

function getAllFromIndexedDB() {
    return openIndexedDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();
        request.onerror = (event) => reject(event);
        request.onsuccess = (event) => resolve(event.target.result);
    }));
}

function getFromIndexedDB(id) {
    return openIndexedDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.get(id);
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

function getFromFirestore(id) {
    return firestore.collection('recipes').doc(id).get().then(doc => doc.exists ? doc.data() : null);
}

async function getUserFromFirestore(email) {
    const querySnapshot = await firestore.collection('users').where('email', '==', email).get();
    return querySnapshot.docs.length ? querySnapshot.docs[0].data() : null;
}

async function getFavoritesIdsFromFirestore() {
    const user = await getUserFromIDB();
    if (user && user[0].email) {
        const fireStoreUser = await getUserFromFirestore(user[0].email);
        return fireStoreUser && fireStoreUser.favorites ? fireStoreUser.favorites : [];
    }
    return [];
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

function addFavoritesListToIndexedDB(favorites, edit_date) {
    return openIndexedDB().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction([userStoreName], 'readwrite');
        const objectStore = transaction.objectStore(userStoreName);
        const favoritesEntry = { id: "userFavorites", favorites: favorites, edit_date: edit_date };
        const request = objectStore.put(favoritesEntry);
        request.onerror = (event) => reject(event);
        request.onsuccess = (event) => resolve();
    }));
}

function addToFirestore(doc) {
    return firestore.collection('recipes').doc(doc.id).set(doc);
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
    await syncFirestoreWithIndexedDB();
    await syncFavoritesFromFirestore();
    await syncOwnRecipesFromFirestore();
    const docs = await getAllFromIndexedDB();
    await Promise.all(docs.map(syncIndexedDBDocToFirestore));
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

async function syncIndexedDBDocToFirestore(doc) {
    if (doc && doc.id) {
        const firestoreDoc = await getFromFirestore(doc.id);
        if (firestoreDoc && firestoreDoc.date_edit) {
            if (doc.date_edit && doc.date_edit.seconds && firestoreDoc.date_edit.seconds && doc.date_edit.seconds > firestoreDoc.date_edit.seconds) {
                await addToFirestore(doc);
                return putToIndexedDB(doc);
            }
            else if(!doc.date_edit || !doc.date_edit.seconds){
                await putToIndexedDB(firestoreDoc);
                return addToFirestore(firestoreDoc);
            }
            else if(!firestoreDoc.date_edit.seconds){
                return addToFirestore(doc);
            }
        } else {
            return addToFirestore(doc);
        }
    }
}

function syncFirestoreDocToIndexedDB(doc) {
    if (doc && doc.id) {
        return getFromIndexedDB(doc.id).then(idbDoc => {
            if (!idbDoc) {
                return addToIndexedDB(doc);
            }
        });
    }
}

function syncFirestoreWithIndexedDB() {
    return getAllFromIndexedDB().then(docs => Promise.all(docs.map(syncIndexedDBDocToFirestore)));
}

async function syncFavoritesFromFirestore() {
    const ids = await getFavoritesIdsFromFirestore();
    await Promise.all(ids.map(id => getFromFirestore(id).then(syncFirestoreDocToIndexedDB)));
    return syncFavoritesList(ids);
}

async function syncFavoritesList(ids) {
    const idbUser = await getUserFromIDB();
    let newFavorites = [];
    let newEditDate = {};
    let firestoreFavorites = ids.favorites ? [...ids.favorites] : [];
    let firestoreEditDate = ids.edit_date ? ids.edit_date : {};
    if (idbUser && idbUser[1]) {
        let idbFavorites = idbUser[1].favorites ? idbUser[1].favorites : [];
        let idbEditDate = idbUser[1].edit_date ? idbUser[1].edit_date : {};
        if (arraysEqual(idbUser[1].favorites, newFavorites)) return;
        else if (idbEditDate && firestoreEditDate) {
            if (firestoreEditDate.seconds > idbEditDate.seconds) {
                newFavorites = firestoreFavorites;
                newEditDate = firestoreEditDate;
            } else {
                newFavorites = idbFavorites;
                newEditDate = idbFavorites;
            }
        } else if (firestoreEditDate) {
            newFavorites = firestoreFavorites;
            newEditDate = firestoreEditDate;
        }  else if (idbEditDate) {
            newFavorites = idbFavorites;
            newEditDate = idbFavorites;
        } else {
            newFavorites = firestoreFavorites;
            newEditDate = firestoreEditDate;
        }
    }
    console.log(idbUser[0], idbUser[0].email);
    if (!arraysEqual(idbUser[1].favorites, newFavorites)) {
        await addFavoritesListToIndexedDB(newFavorites, edit_date);
    }
    if (idbUser[0] && idbUser[0].email && !arraysEqual(ids, newFavorites)) {
        await addFavoritesListToFirestore(idbUser[0].email, newFavorites, newEditDate);
    }
}


// Boiler plate comaparison function
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

async function handleNetworkStatusChange(isOnline) {
    if (isOnline) {
        console.log('Network is online');
        await syncDBs();
    } else {
        console.log('Network is offline');
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
