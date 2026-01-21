import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Simplified auth context - no authentication required
  const getAuthHeaders = () => {
    // Return empty headers since authentication is not required
    return {};
  };

  const value = {
    user: null,
    token: null,
    loading: false,
    isAuthenticated: false,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

