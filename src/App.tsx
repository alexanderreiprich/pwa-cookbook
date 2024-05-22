import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Default from "./pages/default";
import Home from "./pages/home";
import "./App.css";

import { doc, getFirestore } from "firebase/firestore";
import {
  FirestoreProvider,
  useFirestoreDocData,
  useFirestore,
  useFirebaseApp,
} from "reactfire";

// Test function, TODO: remove
function GetDoc() {
  const ref = doc(useFirestore(), "testing", "firsttest");
  const { status, data } = useFirestoreDocData(ref);
  if (status === "loading") {
    return <p>beep boop loading</p>;
  }
  return <p>yoo, it's {data.test ? "true" : "false"}</p>;
}

function App() {
  const firestoreInstance = getFirestore(useFirebaseApp());
  return (
    <FirestoreProvider sdk={firestoreInstance}>
      <GetDoc />
      {/* <BrowserRouter>
        <Routes>
          <Route path="/" element={<Default />} />
          <Route index element={<Home />} />
        </Routes>
      </BrowserRouter> */}
    </FirestoreProvider>
  );
}

export default App;
