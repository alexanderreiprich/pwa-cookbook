import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';

// Boilerplate Network Status Provider

// Define the type for the context value
interface NetworkStatusContextValue {
  isOnline: boolean;
}

// Define the type for the provider props
interface NetworkStatusProviderProps {
  children: ReactNode;
}

// Create a context for the network status
const NetworkStatusContext = createContext<NetworkStatusContextValue>({ isOnline: navigator.onLine });

// Create a provider component
export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

// Custom hook to use the network status
export const useNetworkStatus = () => useContext(NetworkStatusContext);
