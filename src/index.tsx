import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"
import { FirebaseAppProvider} from "reactfire";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { syncFirestoreWithIndexedDB } from "./helpers/synchDBHelper";
import { NetworkStatusProvider } from "./helpers/NetworkStatusProvider";

// Logos by https://iconpacks.net/?utm_source=link-attribution&utm_content=5026

const firebaseConfig = {
  apiKey: "AIzaSyBKEtWnPeJ_oO1r0G5dvyZeAezZzd7T6Jo",
  authDomain: "pwacookbook.firebaseapp.com",
  projectId: "pwacookbook",
  storageBucket: "pwacookbook.appspot.com",
  messagingSenderId: "580668056456",
  appId: "1:580668056456:web:770d132b3cbf581fcc903d",
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
root.render(
  <FirebaseAppProvider firebaseConfig={firebaseConfig}>
    <NetworkStatusProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </NetworkStatusProvider>
  </FirebaseAppProvider>
);

serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();