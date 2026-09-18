import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../../types/index.ts';
import { Permission, hasPermission } from './permissions.ts';

interface SetupStatus {
  needsInitialSetup: boolean;
  adminCount: number;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdminAreaAllowed: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  needsInitialSetup: boolean;
  adminCount: number;
  token: string | null;
  can: (permission: Permission) => boolean;
  checkSetupStatus: () => Promise<SetupStatus>;
  loginCustomer: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (data: { email: string; password: string; fullName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  firstAdminSetup: (data: { email: string; password: string; fullName: string; department?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { fullName?: string; phone?: string; avatarUrl?: string; address?: any }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; demoResetToken?: string; error?: string }>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetToCleanState: () => Promise<void>;
  availableRoles: { role: UserRole; title: string; description: string }[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'rayven_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    needsInitialSetup: false,
    adminCount: 0,
  });

  // Check setup status from server
  const checkSetupStatus = useCallback(async (): Promise<SetupStatus> => {
    try {
      const res = await fetch('/api/auth/setup-status');
      if (res.ok) {
        const data = await res.json();
        setSetupStatus(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to fetch setup status', err);
    }
    return { needsInitialSetup: false, adminCount: 0 };
  }, []);

  // Fetch current authenticated user session
  const fetchCurrentUser = useCallback(async (authToken?: string) => {
    const activeToken = authToken || token;
    if (!activeToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token is expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to verify session token', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    checkSetupStatus();
    fetchCurrentUser();
  }, [checkSetupStatus, fetchCurrentUser]);

  // Customer Sign In
  const loginCustomer = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred' };
    }
  };

  // Customer Sign Up
  const registerCustomer = async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Registration failed' };
      }

      localStorage.setItem(TOKEN_KEY, json.token);
      setToken(json.token);
      setUser(json.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred' };
    }
  };

  // Admin Sign In
  const loginAdmin = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Administrative authentication failed' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      await checkSetupStatus();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred' };
    }
  };

  // First Admin Setup
  const firstAdminSetup = async (data: { email: string; password: string; fullName: string; department?: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/first-admin-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Setup failed' };
      }

      localStorage.setItem(TOKEN_KEY, json.token);
      setToken(json.token);
      setUser(json.user);
      await checkSetupStatus();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred' };
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  };

  // Update Profile
  const updateProfile = async (updates: { fullName?: string; phone?: string; avatarUrl?: string; address?: any }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/customer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Change Password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update password' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Forgot Password Request
  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch('/api/auth/customer/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }
      return {
        success: true,
        message: data.message,
        demoResetToken: data.demoResetToken,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Reset Password Execution
  const resetPassword = async (resetToken: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/customer/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to reset password' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Developer Reset to clean state (for demonstration of First Admin Setup)
  const resetToCleanState = async () => {
    try {
      await fetch('/api/auth/dev/reset-setup', { method: 'POST' });
      await logout();
      await checkSetupStatus();
    } catch (err) {
      console.error('Reset error', err);
    }
  };

  const role = user?.role ?? null;
  const isAuthenticated = !!user;
  const isAdminAreaAllowed = !!(user && ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER'].includes(user.role));
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const availableRoles: { role: UserRole; title: string; description: string }[] = [
    { role: 'SUPER_ADMIN', title: 'Super Admin', description: 'Full executive control across all ERP modules & storefront' },
    { role: 'ADMIN', title: 'Admin', description: 'Catalog, financial operations, orders, and team management' },
    { role: 'MANAGER', title: 'Store Manager', description: 'Inventory, purchase orders, catalog, and order fulfillment' },
    { role: 'CASHIER', title: 'Cashier / POS', description: 'Order processing and inventory view' },
    { role: 'CUSTOMER', title: 'Customer', description: 'Browsing, shopping, cart checkout, and account order tracking' },
  ];

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdminAreaAllowed,
        isSuperAdmin,
        isLoading,
        needsInitialSetup: setupStatus.needsInitialSetup,
        adminCount: setupStatus.adminCount,
        token,
        can,
        checkSetupStatus,
        loginCustomer,
        registerCustomer,
        loginAdmin,
        firstAdminSetup,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        resetToCleanState,
        availableRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
