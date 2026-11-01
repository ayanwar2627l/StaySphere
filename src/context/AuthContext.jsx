import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const stored = localStorage.getItem("ss_user");
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);

  function login(userData) {
    localStorage.setItem("ss_user", JSON.stringify({ name: userData.name, email: userData.email }));
    localStorage.setItem("ss_token", userData.token);
    setUser({ name: userData.name, email: userData.email });
  }

  function logout() {
    localStorage.removeItem("ss_token");
    localStorage.removeItem("ss_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
