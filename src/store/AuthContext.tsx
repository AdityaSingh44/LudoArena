import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { UserStats } from '../types/game';

interface AuthContextType {
  user: UserStats | null;
  token: string | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, avatar?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { avatar?: string; username?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserStats | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ludo_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('ludo_token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const currentUser = await api.getMe();
      setUser(currentUser);

      const socket = socketService.getSocket();
      socket.emit('set_user', {
        userId: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
      });
    } catch (err) {
      console.warn('Auth token expired or invalid:', err);
      localStorage.removeItem('ludo_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    const res = await api.login({ emailOrUsername, password });
    localStorage.setItem('ludo_token', res.token);
    setToken(res.token);
    setUser(res.user);
    socketService.updateAuthToken(res.token);

    const socket = socketService.getSocket();
    socket.emit('set_user', {
      userId: res.user.id,
      username: res.user.username,
      avatar: res.user.avatar,
    });
  };

  const register = async (username: string, email: string, password: string, avatar?: string) => {
    const res = await api.register({ username, email, password, avatar });
    localStorage.setItem('ludo_token', res.token);
    setToken(res.token);
    setUser(res.user);
    socketService.updateAuthToken(res.token);

    const socket = socketService.getSocket();
    socket.emit('set_user', {
      userId: res.user.id,
      username: res.user.username,
      avatar: res.user.avatar,
    });
  };

  const logout = () => {
    localStorage.removeItem('ludo_token');
    setToken(null);
    setUser(null);
    socketService.updateAuthToken(null);
  };

  const updateProfile = async (data: { avatar?: string; username?: string }) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
