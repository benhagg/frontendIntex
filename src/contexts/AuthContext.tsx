import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  email: string;
  roles: string[];
  name?: string;
  age?: number;
  enforceKidsMode?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  phone?: string;
  username?: string;
  age?: string;
  gender?: string;
  city?: string;
  state?: string;
  zip?: string;
  services?: string[];
}

interface RegisterResponse {
  token?: string;
  user?: User;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  enforceKidsMode: boolean;
  kidsMode: boolean;
  kidsModeTimestamp: number;
  toggleKidsMode: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (registerData: RegisterData) => Promise<RegisterResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [enforceKidsMode, setEnforceKidsMode] = useState<boolean>(false);
  const [kidsMode, setKidsMode] = useState<boolean>(() => {
    // Initialize from localStorage, defaulting to enforceKidsMode if it's true
    return localStorage.getItem("kidsMode") === "true" || false;
  });
  // Add a timestamp to track when kidsMode changes
  const [kidsModeTimestamp, setKidsModeTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAdmin(authService.isAdmin());
        
        // Fetch additional user info
        try {
          const userInfo = await authService.getUserInfo();
          if (userInfo) {
            setUser(prevUser => ({
              ...prevUser!,
              name: userInfo.name,
              age: userInfo.age,
              enforceKidsMode: userInfo.enforceKidsMode
            }));
            
            // Set enforceKidsMode state based on user info
            const isEnforced = userInfo.enforceKidsMode || false;
            setEnforceKidsMode(isEnforced);
            
            // If kids mode is enforced, make sure kidsMode is also set to true
            if (isEnforced) {
              setKidsMode(true);
              localStorage.setItem("kidsMode", "true");
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };
    
    checkAuth();
  }, []);

  const toggleKidsMode = useCallback(() => {
    // Only allow toggling if not enforced
    if (!enforceKidsMode) {
      const newMode = !kidsMode;
      setKidsMode(newMode);
      localStorage.setItem("kidsMode", newMode.toString());
      // Update timestamp to trigger refetch in components that depend on kidsMode
      setKidsModeTimestamp(Date.now());
    }
  }, [enforceKidsMode, kidsMode]);

  const login = async (email: string, password: string) => {
    try {
      const { user } = await authService.login(email, password);
      setUser(user);
      setIsAuthenticated(true);
      setIsAdmin(user.roles.includes('Admin'));
      
      // Fetch additional user info
      try {
        const userInfo = await authService.getUserInfo();
        if (userInfo) {
          setUser(prevUser => ({
            ...prevUser!,
            name: userInfo.name,
            age: userInfo.age,
            enforceKidsMode: userInfo.enforceKidsMode
          }));
          
          // Set enforceKidsMode state based on user info
          const isEnforced = userInfo.enforceKidsMode || false;
          setEnforceKidsMode(isEnforced);
          
          // If kids mode is enforced, make sure kidsMode is also set to true
          if (isEnforced) {
            setKidsMode(true);
            localStorage.setItem("kidsMode", "true");
          }
        }
      } catch (infoError) {
        console.error('Error fetching user info:', infoError);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const response = await authService.register(registerData);
      
      // If the backend returns a token and user, set the authentication state
      if (response.token && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        setIsAdmin(response.user.roles.includes('Admin'));
        
        // Fetch additional user info
        try {
          const userInfo = await authService.getUserInfo();
          if (userInfo) {
            setUser(prevUser => ({
              ...prevUser!,
              name: userInfo.name,
              age: userInfo.age,
              enforceKidsMode: userInfo.enforceKidsMode
            }));
            
            // Set enforceKidsMode state based on user info
            const isEnforced = userInfo.enforceKidsMode || false;
            setEnforceKidsMode(isEnforced);
            
            // If kids mode is enforced, make sure kidsMode is also set to true
            if (isEnforced) {
              setKidsMode(true);
              localStorage.setItem("kidsMode", "true");
            }
          }
        } catch (infoError) {
          console.error('Error fetching user info:', infoError);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    enforceKidsMode,
    kidsMode,
    kidsModeTimestamp,
    toggleKidsMode,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
