import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "..";
import { useNetworkStatus } from "../helpers/NetworkStatusProvider";

interface AuthContextType {
  currentUser: User | OfflineUser | null
}
export type OfflineUser = {
  displayName: string,
  email: string
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
  const [currentUser, setCurrentUser] = useState<User | OfflineUser | null>(null);
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
      setCurrentUser({displayName: "localUser", email:"offline@user.com"})
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