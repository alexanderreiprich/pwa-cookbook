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
    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject(event);
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
}

function getAllFromIndexedDB() {
  return openIndexedDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.getAll();
      request.onerror = (event) => {
        reject(event);
      };
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  });
}

function getFromIndexedDB(id) {
    return openIndexedDB().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.get(id);
        request.onerror = (event) => {
          reject(event);
        };
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
      });
    });
  }

function addToFirestore(doc) {
  return firestore.collection('recipes').doc(doc.id).set(doc);
}

function addToIndexedDB(doc) {
    return openIndexedDB().then((db) => {
        return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.put(doc);
        request.onerror = (event) => {
            reject(event);
        };
        request.onsuccess = (event) => {
            resolve();
        };
        });
    });
}

async function addFavoritesListToFirestore(email, favorites) {
    console.log("add favorites to firestore", favorites);
    let user = getUserFromFirestore(email);
    console.log("addFavoritesListToFirestore", email, user, favorites);
}

function addFavoritesListToIndexedDB(favorites) {
    console.log("add favorites to idb", favorites);
    return openIndexedDB().then((db) => {
        return new Promise((resolve, reject) => {
        const transaction = db.transaction([userStoreName], 'readwrite');
        const objectStore = transaction.objectStore(userStoreName);
        const favoritesEntry = { id: "userFavorites", favorites: favorites }; 
        const request = objectStore.put(favoritesEntry);
        console.log("request", request);
        request.onerror = (event) => {
            reject(event);
        };
        request.onsuccess = (event) => {
            resolve();
            console.log("event", event);
        };
        });
    });
}

function getFromFirestore(id) {
    return firestore.collection('recipes').doc(id).get().then(doc => {
        return doc.exists ? doc.data() : null;
    });
}

async function syncOwnRecipesFromFirestore() {
    let recipes = []
        // gets email from idb to find the right user in the firestore and get the favorites ids from there
    let user = await getEmailFromIDB();
    if(user && user[0].email){
        let email = user[0].email;
        if(email){
            // get all recipes where author has the email saved in the idb
            let querySnapshot = await firestore.collection('recipes').where('author', '==', email).get();
            recipes = querySnapshot.docs.map(doc => doc.data());
        }
    }
    recipes.map(doc => syncFirestoreDocToIndexedDB(doc));
}


function syncIndexedDBDocToFirestore(doc) {
    if(doc && doc.id){
        return getFromFirestore(doc.id).then(firestoreDoc => {
            if (firestoreDoc) {
            const indexedDBDate = doc.date_edit;
            const firestoreDate = firestoreDoc.date_edit;

            if (indexedDBDate > firestoreDate) {
                return addToFirestore(doc).then(() => addToIndexedDB(doc));
            } else {
                return addToIndexedDB(firestoreDoc).then(() => addToFirestore(firestoreDoc));
            }
            } else {
            return addToFirestore(doc);
            }
        });
    }
}

function syncFirestoreDocToIndexedDB(doc) {
    if(doc && doc.id){
        getFromIndexedDB(doc.id).then(idbDoc => {
            if (!idbDoc) {
                addToIndexedDB(doc);
            }
        });
    }
}

function syncFirestoreWithIndexedDB() {
  return getAllFromIndexedDB().then((docs) => {
    const promises = docs.map(doc => addToFirestore(doc));
    return Promise.all(promises);
  });
}

async function syncFavoritesFromFirestore() {
    let ids = await getFavoritesIdsFromFirestore();
    ids.forEach(id => {
        getFromFirestore(id).then(doc => syncFirestoreDocToIndexedDB(doc));
    })
    syncFavoritesList(ids);
}

async function getFavoritesIdsFromFirestore() {
    let favorites = [];
    // gets email from idb to find the right user in the firestore and get the favorites ids from there
    let user = await getEmailFromIDB();
    if(user && user[0].email){
        let email = user[0].email;
        if(email){
            let fireStoreUser = await getUserFromFirestore(email);
                if(fireStoreUser.favorites){
                    favorites = fireStoreUser.favorites;
                }
            }
    }
    return favorites;
}

async function getUserFromFirestore(email) {
    let fireStoreUser;
    await firestore.collection('users').get().then(querySnapshot => {
        querySnapshot.docs.map(doc => {
            let user = doc.data();
            if(user.email && user.email == email){
                fireStoreUser = user;
            }
        });
    });
    return fireStoreUser;
}

async function getEmailFromIDB() {
    return openIndexedDB().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([userStoreName], 'readonly');
            const objectStore = transaction.objectStore(userStoreName);
            const request = objectStore.getAll();
            request.onerror = (event) => {
                reject(event);
            };
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
    });
}

async function getUserFromIDB() {
    return openIndexedDB().then((db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([userStoreName], 'readonly');
            const objectStore = transaction.objectStore(userStoreName);
            const request = objectStore.getAll();
            request.onerror = (event) => {
                reject(event);
            };
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
        });
    })
}

async function syncFavoritesList(ids) {
   return getUserFromIDB().then( idbUser => {
        let newFavorites = ids;
        if(idbUser && idbUser[1] && idbUser[1].favorites){
            if(idbUser[1].favorites == newFavorites) return;
            idbUser[1].favorites.forEach(favorite => {
                if(!newFavorites.includes(favorite)) newFavorites.push(favorite);
            })
        }
        addFavoritesListToIndexedDB(newFavorites);
        if(newFavorites != ids && idbUser.email)addFavoritesListToFirestore(idbUser.email, newFavorites);
        }).catch((err) => {
            console.log(err);
            return ids;
    }).catch((err) => {
        console.log(err);
        return ids;
    });
}

async function syncDBs(event) {
    event.waitUntil(syncFirestoreWithIndexedDB());
    event.waitUntil(syncFavoritesFromFirestore());
    event.waitUntil(syncOwnRecipesFromFirestore());
    event.waitUntil(getAllFromIndexedDB().then(doc => doc.map(recipe => syncIndexedDBDocToFirestore(recipe))));
}


// Service Worker events
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  syncDBs(event);
});

self.addEventListener('sync', (event) => {
  console.log('Background sync', event);
  if (event.tag === 'sync-recipes') {
    syncDBs(event);
  }
});
