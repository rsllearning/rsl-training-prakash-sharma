import { createContext, useContext, useState } from 'react';

export const UserContext = createContext(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserContext');
  }
  return context;
}

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const loginUser = (userData) => setUser(userData);
  const logoutUser = () => setUser(null);

  return (
    <UserContext value={{ user, isLoggedIn: !!user, loginUser, logoutUser }}>
      {children}
    </UserContext>
  );
}
