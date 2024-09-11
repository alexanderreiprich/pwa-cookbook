import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "..";
import { useNetworkStatus } from "../helpers/NetworkStatusProvider";

interface AuthContextType {
  currentUser: User  | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider!");
  }
  return context;
}

export const AuthProvider = ({children}: {children: any}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return () => {
        unsubscribe();
      }
    }
    else {
      setCurrentUser(null)
    }

  }, []);

  if (loading) {
    return <div>Lade Nutzer...</div>
  }

  return (
    <AuthContext.Provider value={{currentUser}}>
      {children}
    </AuthContext.Provider>
  )
}