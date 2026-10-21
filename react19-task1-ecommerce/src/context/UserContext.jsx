import { createContext, useContext, useState } from 'react';

// Create standard React Context
export const UserContext = createContext(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserContext');
  }
  return context;
}

// React 19 allows rendering <UserContext value={...}> directly without .Provider!
export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = () => {
    setUser(null);
  };

  const contextValue = {
    user,
    isLoggedIn: !!user,
    loginUser,
    logoutUser
  };

  // React 19 syntax: <UserContext value={...}> instead of <UserContext.Provider value={...}>
  return (
    <UserContext value={contextValue}>
      {children}
    </UserContext>
  );
}
