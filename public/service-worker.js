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

function getFromFirestore(id) {
    return firestore.collection('recipes').doc(id).get().then(doc => {
        return doc.exists ? doc.data() : null;
    });
}

function compareAndSync(doc) {
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

function syncFirestoreWithIndexedDB() {
    console.log("syncFirestoreWithIndexedDB");
  return getAllFromIndexedDB().then((docs) => {
    const promises = docs.map(doc => addToFirestore(doc));
    return Promise.all(promises);
  });
}



// Service Worker events
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
  event.waitUntil(syncFirestoreWithIndexedDB());
  event.waitUntil(getAllFromIndexedDB().then(doc => doc.map(recipe => compareAndSync(recipe))));
});

self.addEventListener('sync', (event) => {
  console.log('Background sync', event);
  if (event.tag === 'sync-recipes') {
    event.waitUntil(syncFirestoreWithIndexedDB());
    event.waitUntil(getAllFromIndexedDB().then(doc => doc.map(recipe => compareAndSync(recipe))));
  }
});
