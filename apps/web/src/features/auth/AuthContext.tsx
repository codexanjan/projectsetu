import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@projectsetu/contracts';
import { AppStorage } from '@/lib/storage';
import { getRolePermissions, UserPermissions } from '@/lib/permissions';
import { SEED_USERS } from '@/lib/mockData';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  permissions: UserPermissions;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  availableUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    AppStorage.init();
    return AppStorage.getCurrentUser();
  });

  const availableUsers = SEED_USERS;

  useEffect(() => {
    const handleUpdate = () => {
      const current = AppStorage.getCurrentUser();
      setUser(current);
    };
    window.addEventListener('projectsetu-update', handleUpdate);
    return () => window.removeEventListener('projectsetu-update', handleUpdate);
  }, []);

  const role: UserRole = user ? user.role : 'citizen';
  const permissions = getRolePermissions(role);
  const isAuthenticated = user !== null && role !== 'citizen';

  const login = async (email: string): Promise<boolean> => {
    const found = availableUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      AppStorage.setCurrentUser(found);
      setUser(found);
      return true;
    }
    // Generic fallback mock user
    const fallback: UserProfile = {
      uid: `user-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      role: 'agency_manager',
      organizationId: 'org-default',
      organizationName: 'State Infrastructure Agency',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    AppStorage.setCurrentUser(fallback);
    setUser(fallback);
    return true;
  };

  const logout = () => {
    const citizenUser: UserProfile = {
      uid: 'anon-citizen',
      email: 'public@citizen.nic.in',
      displayName: 'Citizen Visitor',
      role: 'citizen',
      organizationId: '',
      organizationName: 'Public Domain',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    AppStorage.setCurrentUser(citizenUser);
    setUser(citizenUser);
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'citizen') {
      logout();
      return;
    }
    const matched = availableUsers.find(u => u.role === newRole);
    if (matched) {
      AppStorage.setCurrentUser(matched);
      setUser(matched);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        isAuthenticated,
        login,
        logout,
        switchRole,
        availableUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
