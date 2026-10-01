import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getToken, setToken as saveApiToken, removeToken } from '../services/api';
import { saveAvatar, getSavedAvatar } from '../data/avatars';

export interface User {
  id?: string;
  _id?: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('dramify_user');
    if (savedUser && getToken()) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount if token exists
  useEffect(() => {
    let isMounted = true;
    const currentToken = getToken();

    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    authApi
      .getMe()
      .then((userData) => {
        if (!isMounted) return;
        if (userData && (userData._id || userData.id || userData.username)) {
          const formattedUser: User = {
            id: userData._id || userData.id,
            username: userData.username,
            displayName: userData.displayName || userData.username,
            email: userData.email,
            avatarUrl: userData.avatarUrl || getSavedAvatar(),
            bio: userData.bio || '',
          };
          setUser(formattedUser);
          localStorage.setItem('dramify_user', JSON.stringify(formattedUser));
          if (formattedUser.avatarUrl) {
            saveAvatar(formattedUser.avatarUrl);
          }
        }
      })
      .catch(() => {
        // If token is invalid or expired, clear out session
        if (!isMounted) return;
        removeToken();
        localStorage.removeItem('dramify_user');
        setUser(null);
        setTokenState(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    saveApiToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
    localStorage.setItem('dramify_user', JSON.stringify(newUser));
    if (newUser.avatarUrl) {
      saveAvatar(newUser.avatarUrl);
    }
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem('dramify_user');
    setTokenState(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('dramify_user', JSON.stringify(updated));
      if (updates.avatarUrl) {
        saveAvatar(updates.avatarUrl);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
